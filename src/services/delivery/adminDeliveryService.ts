/**
 * Admin Delivery Service
 * 
 * Provides administrative functions for:
 * - Zone management (CRUD, suspend/resume)
 * - Rule management
 * - Rider/job management
 * - Import/export zones
 * - Preview/dry-run quotes
 */

import { prisma } from '../../lib/prisma';
import { getDeliveryQuote, DeliveryQuoteRequest, DeliveryQuoteResponse } from './deliveryQuoteService';

// ============== TYPES ==============

export interface ZoneCreateInput {
  code: string;
  name: string;
  state: string;
  type: 'polygon' | 'centroid-fallback';
  center: { lat: number; lng: number };
  radius_km?: number;
  boundaries?: any; // GeoJSON polygon
  pricing: {
    base_fee_ngn: number;
    per_km_rate_ngn: number;
    min_fee_ngn: number;
    max_fee_ngn: number;
    free_distance_km?: number;
  };
  eta: {
    base_dispatch_minutes: number;
    travel_profile: string;
    congestion_factor: number;
    operational_buffer_percent: number;
    pickup_handling_minutes: { min: number; max: number };
  };
  delivery_types: string[];
}

export interface ZoneUpdateInput {
  name?: string;
  pricing?: Partial<ZoneCreateInput['pricing']>;
  eta?: Partial<ZoneCreateInput['eta']>;
  delivery_types?: string[];
  is_active?: boolean;
}

export interface RiderAvailabilityUpdate {
  zone_code: string;
  active_riders: number;
  queued_jobs: number;
}

export interface PricingRuleInput {
  name: string;
  description?: string;
  rule_type: 'set_fee' | 'add_fee' | 'percent_of_subtotal' | 'multiplier' | 'free_shipping' | 'block_delivery';
  priority: number;
  conditions: {
    zones?: string[];
    min_subtotal?: number;
    max_subtotal?: number;
    delivery_types?: string[];
    time_range?: { start: string; end: string };
    days_of_week?: number[];
  };
  action: {
    value: number;
    reason?: string;
  };
  valid_from?: Date;
  valid_to?: Date;
  is_active?: boolean;
}

export interface ImportZonesInput {
  format: 'geojson' | 'csv';
  data: any;
  options?: {
    overwrite?: boolean;
    validate_only?: boolean;
  };
}

export interface PreviewQuoteInput {
  items: Array<{
    price: number;
    quantity: number;
    weight_kg?: number;
    dimensions?: { length_cm: number; width_cm: number; height_cm: number };
    pickup_location_id: string;
    pickup_coords?: { lat: number; lng: number };
  }>;
  delivery_coords: { lat: number; lng: number };
  delivery_type: string;
  payment_method: string;
}

// ============== ZONE MANAGEMENT ==============

export class AdminDeliveryService {
  
  /**
   * Create a new delivery zone
   */
  static async createZone(input: ZoneCreateInput): Promise<any> {
    const zoneData = {
      code: input.code,
      name: input.name,
      state: input.state,
      type: input.type,
      centerPoint: JSON.stringify(input.center),
      radius_km: input.radius_km,
      boundaries: input.boundaries ? JSON.stringify(input.boundaries) : null,
      baseFee: input.pricing.base_fee_ngn,
      perKmFee: input.pricing.per_km_rate_ngn,
      minFee: input.pricing.min_fee_ngn,
      maxFee: input.pricing.max_fee_ngn,
      free_distance_km: input.pricing.free_distance_km ?? 0,
      eta_config: JSON.stringify(input.eta),
      delivery_types: JSON.stringify(input.delivery_types),
      isActive: true,
      is_suspended: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Use raw command for MongoDB
    const result = await prisma.$runCommandRaw({
      insert: 'benue_lga_zones',
      documents: [zoneData]
    });
    
    return { success: true, zone: zoneData };
  }
  
  /**
   * Update an existing zone
   */
  static async updateZone(code: string, input: ZoneUpdateInput): Promise<any> {
    const updateData: any = { updatedAt: new Date() };
    
    if (input.name) updateData.name = input.name;
    if (input.pricing) {
      if (input.pricing.base_fee_ngn !== undefined) updateData.baseFee = input.pricing.base_fee_ngn;
      if (input.pricing.per_km_rate_ngn !== undefined) updateData.perKmFee = input.pricing.per_km_rate_ngn;
      if (input.pricing.min_fee_ngn !== undefined) updateData.minFee = input.pricing.min_fee_ngn;
      if (input.pricing.max_fee_ngn !== undefined) updateData.maxFee = input.pricing.max_fee_ngn;
      if (input.pricing.free_distance_km !== undefined) updateData.free_distance_km = input.pricing.free_distance_km;
    }
    if (input.eta) {
      updateData.eta_config = JSON.stringify(input.eta);
    }
    if (input.delivery_types) {
      updateData.delivery_types = JSON.stringify(input.delivery_types);
    }
    if (input.is_active !== undefined) {
      updateData.isActive = input.is_active;
    }
    
    const result = await prisma.$runCommandRaw({
      update: 'benue_lga_zones',
      updates: [
        {
          q: { code },
          u: { $set: updateData }
        }
      ]
    });
    
    return { success: true, updated: result };
  }
  
  /**
   * Suspend a delivery zone
   */
  static async suspendZone(code: string, reason: string): Promise<any> {
    const result = await prisma.$runCommandRaw({
      update: 'benue_lga_zones',
      updates: [
        {
          q: { code },
          u: {
            $set: {
              is_suspended: true,
              suspension_reason: reason,
              suspended_at: new Date(),
              updatedAt: new Date()
            }
          }
        }
      ]
    });
    
    // Also update Makurdi zones if applicable
    if (code.startsWith('MKD-')) {
      await prisma.$runCommandRaw({
        update: 'makurdi_delivery_zones',
        updates: [
          {
            q: { code },
            u: {
              $set: {
                is_suspended: true,
                suspension_reason: reason,
                suspended_at: new Date(),
                updatedAt: new Date()
              }
            }
          }
        ]
      });
    }
    
    return { success: true, zone: code, suspended: true, reason };
  }
  
  /**
   * Resume a suspended zone
   */
  static async resumeZone(code: string): Promise<any> {
    const result = await prisma.$runCommandRaw({
      update: 'benue_lga_zones',
      updates: [
        {
          q: { code },
          u: {
            $set: {
              is_suspended: false,
              suspension_reason: null,
              resumed_at: new Date(),
              updatedAt: new Date()
            },
            $unset: {
              suspended_at: ''
            }
          }
        }
      ]
    });
    
    // Also update Makurdi zones if applicable
    if (code.startsWith('MKD-')) {
      await prisma.$runCommandRaw({
        update: 'makurdi_delivery_zones',
        updates: [
          {
            q: { code },
            u: {
              $set: {
                is_suspended: false,
                suspension_reason: null,
                resumed_at: new Date(),
                updatedAt: new Date()
              },
              $unset: {
                suspended_at: ''
              }
            }
          }
        ]
      });
    }
    
    return { success: true, zone: code, resumed: true };
  }
  
  /**
   * Get all zones (with optional filter for suspended)
   */
  static async getZones(includeSuspended: boolean = false): Promise<any[]> {
    const filter = includeSuspended ? {} : { is_suspended: { $ne: true } };
    
    const makurdiZones = await prisma.$runCommandRaw({
      find: 'makurdi_delivery_zones',
      filter
    }) as any;
    
    const lgaZones = await prisma.$runCommandRaw({
      find: 'benue_lga_zones',
      filter
    }) as any;
    
    const zones = [
      ...(makurdiZones?.cursor?.firstBatch || []),
      ...(lgaZones?.cursor?.firstBatch || [])
    ];
    
    return zones;
  }
  
  /**
   * Delete a zone (soft delete)
   */
  static async deleteZone(code: string): Promise<any> {
    const result = await prisma.$runCommandRaw({
      update: 'benue_lga_zones',
      updates: [
        {
          q: { code },
          u: {
            $set: {
              isActive: false,
              is_deleted: true,
              deleted_at: new Date(),
              updatedAt: new Date()
            }
          }
        }
      ]
    });
    
    return { success: true, zone: code, deleted: true };
  }
  
  // ============== RIDER/JOB MANAGEMENT ==============
  
  /**
   * Update rider availability for a zone
   */
  static async updateRiderAvailability(updates: RiderAvailabilityUpdate[]): Promise<any> {
    const results = [];
    
    for (const update of updates) {
      const result = await prisma.$runCommandRaw({
        update: 'zone_rider_availability',
        updates: [
          {
            q: { zone_code: update.zone_code },
            u: {
              $set: {
                active_riders: update.active_riders,
                queued_jobs: update.queued_jobs,
                updated_at: new Date()
              },
              $setOnInsert: {
                created_at: new Date()
              }
            },
            upsert: true
          }
        ]
      });
      results.push({ zone: update.zone_code, result });
    }
    
    return { success: true, updates: results };
  }
  
  /**
   * Get rider availability for all zones
   */
  static async getRiderAvailability(): Promise<any[]> {
    const result = await prisma.$runCommandRaw({
      find: 'zone_rider_availability',
      filter: {}
    }) as any;
    
    return result?.cursor?.firstBatch || [];
  }
  
  // ============== PRICING RULES ==============
  
  /**
   * Create a pricing rule
   */
  static async createPricingRule(input: PricingRuleInput): Promise<any> {
    const ruleData = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      description: input.description,
      rule_type: input.rule_type,
      priority: input.priority,
      conditions: JSON.stringify(input.conditions),
      action: JSON.stringify(input.action),
      valid_from: input.valid_from,
      valid_to: input.valid_to,
      is_active: input.is_active ?? true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await prisma.$runCommandRaw({
      insert: 'delivery_pricing_rules',
      documents: [ruleData]
    });
    
    return { success: true, rule: ruleData };
  }
  
  /**
   * Update a pricing rule
   */
  static async updatePricingRule(ruleId: string, input: Partial<PricingRuleInput>): Promise<any> {
    const updateData: any = { updated_at: new Date() };
    
    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.rule_type) updateData.rule_type = input.rule_type;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.conditions) updateData.conditions = JSON.stringify(input.conditions);
    if (input.action) updateData.action = JSON.stringify(input.action);
    if (input.valid_from !== undefined) updateData.valid_from = input.valid_from;
    if (input.valid_to !== undefined) updateData.valid_to = input.valid_to;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    
    const result = await prisma.$runCommandRaw({
      update: 'delivery_pricing_rules',
      updates: [
        {
          q: { id: ruleId },
          u: { $set: updateData }
        }
      ]
    });
    
    return { success: true, updated: result };
  }
  
  /**
   * Delete a pricing rule
   */
  static async deletePricingRule(ruleId: string): Promise<any> {
    const result = await prisma.$runCommandRaw({
      update: 'delivery_pricing_rules',
      updates: [
        {
          q: { id: ruleId },
          u: {
            $set: {
              is_active: false,
              is_deleted: true,
              deleted_at: new Date()
            }
          }
        }
      ]
    });
    
    return { success: true, deleted: ruleId };
  }
  
  /**
   * Get all pricing rules
   */
  static async getPricingRules(includeInactive: boolean = false): Promise<any[]> {
    const filter = includeInactive ? { is_deleted: { $ne: true } } : { is_active: true, is_deleted: { $ne: true } };
    
    const result = await prisma.$runCommandRaw({
      find: 'delivery_pricing_rules',
      filter,
      sort: { priority: -1, id: 1 }
    }) as any;
    
    return result?.cursor?.firstBatch || [];
  }
  
  // ============== IMPORT/EXPORT ==============
  
  /**
   * Import zones from GeoJSON or CSV
   */
  static async importZones(input: ImportZonesInput): Promise<any> {
    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };
    
    try {
      let zones: any[] = [];
      
      if (input.format === 'geojson') {
        // Parse GeoJSON features
        const features = input.data.features || [];
        zones = features.map((feature: any) => ({
          code: feature.properties.code,
          name: feature.properties.name,
          state: feature.properties.state || 'Benue',
          type: feature.geometry.type === 'Point' ? 'centroid-fallback' : 'polygon',
          center: feature.geometry.type === 'Point' 
            ? { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] }
            : this.calculateCentroid(feature.geometry.coordinates),
          boundaries: feature.geometry.type !== 'Point' ? feature.geometry : null,
          pricing: feature.properties.pricing || {
            base_fee_ngn: 500,
            per_km_rate_ngn: 50,
            min_fee_ngn: 500,
            max_fee_ngn: 10000,
            free_distance_km: 0
          },
          eta: feature.properties.eta || {
            base_dispatch_minutes: 60,
            travel_profile: 'rural',
            congestion_factor: 0.15,
            operational_buffer_percent: 0.25,
            pickup_handling_minutes: { min: 10, max: 20 }
          },
          delivery_types: feature.properties.delivery_types || ['standard', 'scheduled']
        }));
      } else if (input.format === 'csv') {
        // Parse CSV rows
        const rows = input.data.split('\n').slice(1); // Skip header
        for (const row of rows) {
          const [code, name, lat, lng, baseFee, perKmFee] = row.split(',');
          if (code && name && lat && lng) {
            zones.push({
              code: code.trim(),
              name: name.trim(),
              state: 'Benue',
              type: 'centroid-fallback',
              center: { lat: parseFloat(lat), lng: parseFloat(lng) },
              pricing: {
                base_fee_ngn: parseInt(baseFee) || 500,
                per_km_rate_ngn: parseInt(perKmFee) || 50,
                min_fee_ngn: 500,
                max_fee_ngn: 10000,
                free_distance_km: 0
              },
              eta: {
                base_dispatch_minutes: 60,
                travel_profile: 'rural',
                congestion_factor: 0.15,
                operational_buffer_percent: 0.25,
                pickup_handling_minutes: { min: 10, max: 20 }
              },
              delivery_types: ['standard', 'scheduled']
            });
          }
        }
      }
      
      results.total = zones.length;
      
      if (input.options?.validate_only) {
        return { success: true, validation: results, zones_parsed: zones.length };
      }
      
      // Import zones
      for (const zone of zones) {
        try {
          if (input.options?.overwrite) {
            await this.createZone(zone);
          } else {
            // Check if exists
            const existing = await prisma.$runCommandRaw({
              find: 'benue_lga_zones',
              filter: { code: zone.code },
              limit: 1
            }) as any;
            
            if (existing?.cursor?.firstBatch?.length > 0) {
              results.skipped++;
              continue;
            }
            
            await this.createZone(zone);
          }
          results.imported++;
        } catch (err: any) {
          results.errors.push(`${zone.code}: ${err.message}`);
        }
      }
      
      return { success: true, results };
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Calculate centroid from polygon coordinates
   */
  private static calculateCentroid(coordinates: number[][][]): { lat: number; lng: number } {
    const ring = coordinates[0]; // Outer ring
    let sumLat = 0;
    let sumLng = 0;
    
    for (const coord of ring) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
    
    return {
      lat: sumLat / ring.length,
      lng: sumLng / ring.length
    };
  }
  
  // ============== PREVIEW/DRY-RUN ==============
  
  /**
   * Preview a delivery quote (dry-run)
   */
  static async previewQuote(input: PreviewQuoteInput): Promise<DeliveryQuoteResponse> {
    const request: DeliveryQuoteRequest = {
      cart_id: `preview_${Date.now()}`,
      subtotal_ngn: input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      items: input.items.map((item, idx) => ({
        id: `preview_item_${idx}`,
        product_id: `preview_product_${idx}`,
        quantity: item.quantity,
        price: item.price,
        weight_kg: item.weight_kg,
        dimensions: item.dimensions,
        pickup_location_id: item.pickup_location_id,
        pickup_coords: item.pickup_coords
      })),
      payment_method: input.payment_method as any,
      delivery_coords: input.delivery_coords,
      delivery_type: input.delivery_type as any,
      requested_at: new Date().toISOString()
    };
    
    return getDeliveryQuote(request);
  }
  
  // ============== AUDIT ==============
  
  /**
   * Get quote audit log
   */
  static async getQuoteAuditLog(options: {
    from?: Date;
    to?: Date;
    zone?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const filter: any = {};
    
    if (options.from || options.to) {
      filter.created_at = {};
      if (options.from) filter.created_at.$gte = options.from;
      if (options.to) filter.created_at.$lte = options.to;
    }
    
    if (options.zone) {
      filter.$or = [
        { 'pickup_zone': options.zone },
        { 'delivery_zone': options.zone }
      ];
    }
    
    const result = await prisma.$runCommandRaw({
      find: 'delivery_quote_audit',
      filter,
      sort: { created_at: -1 },
      limit: options.limit || 100,
      skip: options.offset || 0
    }) as any;
    
    return {
      quotes: result?.cursor?.firstBatch || [],
      total: result?.cursor?.firstBatch?.length || 0
    };
  }
  
  /**
   * Log a quote for auditing
   */
  static async logQuote(quote: DeliveryQuoteResponse, request: DeliveryQuoteRequest): Promise<void> {
    const auditEntry = {
      cart_id: quote.cart_id,
      request: JSON.stringify(request),
      response: JSON.stringify(quote),
      grand_total_ngn: quote.grand_total_ngn,
      distance_km: quote.distance_km,
      effective_weight_kg: quote.effective_weight_kg,
      delivery_type: request.delivery_type,
      applied_rules: quote.delivery_options[0]?.applied_rules || [],
      created_at: new Date()
    };
    
    await prisma.$runCommandRaw({
      insert: 'delivery_quote_audit',
      documents: [auditEntry]
    });
  }
  
  // ============== TRAVEL PROFILE MANAGEMENT ==============
  
  /**
   * Update travel profile for a zone
   */
  static async updateZoneTravelProfile(
    zoneCode: string, 
    profile: { travel_profile: string; congestion_factor?: number }
  ): Promise<any> {
    // Get current eta_config
    const zones = await prisma.$runCommandRaw({
      find: 'benue_lga_zones',
      filter: { code: zoneCode },
      limit: 1
    }) as any;
    
    const zone = zones?.cursor?.firstBatch?.[0];
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }
    
    const currentEta = JSON.parse(zone.eta_config || '{}');
    const newEta = {
      ...currentEta,
      travel_profile: profile.travel_profile,
      ...(profile.congestion_factor !== undefined && { congestion_factor: profile.congestion_factor })
    };
    
    const result = await prisma.$runCommandRaw({
      update: 'benue_lga_zones',
      updates: [
        {
          q: { code: zoneCode },
          u: {
            $set: {
              eta_config: JSON.stringify(newEta),
              updatedAt: new Date()
            }
          }
        }
      ]
    });
    
    return { success: true, zone: zoneCode, eta: newEta };
  }
  
  /**
   * Toggle delivery types for a zone
   */
  static async toggleDeliveryType(zoneCode: string, deliveryType: string, enabled: boolean): Promise<any> {
    const zones = await prisma.$runCommandRaw({
      find: 'benue_lga_zones',
      filter: { code: zoneCode },
      limit: 1
    }) as any;
    
    const zone = zones?.cursor?.firstBatch?.[0];
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }
    
    let deliveryTypes = JSON.parse(zone.delivery_types || '[]');
    
    if (enabled && !deliveryTypes.includes(deliveryType)) {
      deliveryTypes.push(deliveryType);
    } else if (!enabled) {
      deliveryTypes = deliveryTypes.filter((t: string) => t !== deliveryType);
    }
    
    const result = await prisma.$runCommandRaw({
      update: 'benue_lga_zones',
      updates: [
        {
          q: { code: zoneCode },
          u: {
            $set: {
              delivery_types: JSON.stringify(deliveryTypes),
              updatedAt: new Date()
            }
          }
        }
      ]
    });
    
    return { success: true, zone: zoneCode, delivery_types: deliveryTypes };
  }

  // ============== GLOBAL SETTINGS ==============
  
  /**
   * Get global delivery settings
   */
  static async getGlobalSettings(): Promise<any> {
    try {
      // Try to get from database
      const result = await prisma.$runCommandRaw({
        find: 'delivery_settings',
        filter: { id: 'global' },
        limit: 1
      }) as any;
      
      const settings = result?.cursor?.firstBatch?.[0];
      
      if (settings) {
        return {
          base_fee_ngn: settings.base_fee_ngn || 300,
          per_km_rate_ngn: settings.per_km_rate_ngn || 50,
          free_distance_km: settings.free_distance_km || 0,
          platform_commission_percent: settings.platform_commission_percent || 15,
          weight_surcharge_per_kg: settings.weight_surcharge_per_kg || 100,
          volumetric_divisor: settings.volumetric_divisor || 5000,
          insurance_rate_percent: settings.insurance_rate_percent || 1,
          min_insurance_threshold: settings.min_insurance_threshold || 50000,
          delivery_type_multipliers: settings.delivery_type_multipliers || {
            standard: 1.0,
            express: 1.3,
            same_day: 1.5
          }
        };
      }
      
      // Return defaults if no settings exist
      return {
        base_fee_ngn: 300,
        per_km_rate_ngn: 50,
        free_distance_km: 0,
        platform_commission_percent: 15,
        weight_surcharge_per_kg: 100,
        volumetric_divisor: 5000,
        insurance_rate_percent: 1,
        min_insurance_threshold: 50000,
        delivery_type_multipliers: {
          standard: 1.0,
          express: 1.3,
          same_day: 1.5
        }
      };
    } catch (error) {
      console.error('Error getting global settings:', error);
      // Return defaults on error
      return {
        base_fee_ngn: 300,
        per_km_rate_ngn: 50,
        free_distance_km: 0,
        platform_commission_percent: 15,
        weight_surcharge_per_kg: 100,
        volumetric_divisor: 5000,
        insurance_rate_percent: 1,
        min_insurance_threshold: 50000,
        delivery_type_multipliers: {
          standard: 1.0,
          express: 1.3,
          same_day: 1.5
        }
      };
    }
  }
  
  /**
   * Update global delivery settings
   */
  static async updateGlobalSettings(settings: any): Promise<any> {
    try {
      const updateData = {
        id: 'global',
        base_fee_ngn: settings.base_fee_ngn,
        per_km_rate_ngn: settings.per_km_rate_ngn,
        free_distance_km: settings.free_distance_km,
        platform_commission_percent: settings.platform_commission_percent,
        weight_surcharge_per_kg: settings.weight_surcharge_per_kg,
        volumetric_divisor: settings.volumetric_divisor,
        insurance_rate_percent: settings.insurance_rate_percent,
        min_insurance_threshold: settings.min_insurance_threshold,
        delivery_type_multipliers: settings.delivery_type_multipliers,
        updated_at: new Date()
      };
      
      // Upsert the settings
      await prisma.$runCommandRaw({
        update: 'delivery_settings',
        updates: [
          {
            q: { id: 'global' },
            u: { $set: updateData },
            upsert: true
          }
        ]
      });
      
      return { success: true, settings: updateData };
    } catch (error: any) {
      console.error('Error updating global settings:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AdminDeliveryService;
