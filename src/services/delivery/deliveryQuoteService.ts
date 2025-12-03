/**
 * Delivery Quote Service v2.0
 * 
 * Implements the complete delivery fee computation logic with:
 * - Haversine distance calculation (3 decimal precision)
 * - Volumetric weight calculation
 * - Per-pickup multi-shipment support
 * - Deterministic rule evaluation
 * - Enhanced ETA model with traffic and rider availability
 */

import { prisma } from '../../lib/prisma';
import benueZonesData from '../../data/benue-lgas-seed.json';

// ============== TYPES ==============

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  weight_kg?: number;
  dimensions?: {
    length_cm: number;
    width_cm: number;
    height_cm: number;
  };
  pickup_location_id: string;
  pickup_coords?: { lat: number; lng: number };
}

export interface DeliveryQuoteRequest {
  cart_id: string;
  subtotal_ngn: number;
  items: CartItem[];
  payment_method: 'card' | 'bank_transfer' | 'cod' | 'mobile_money';
  pickup_coords?: { lat: number; lng: number };
  delivery_coords: { lat: number; lng: number };
  delivery_type: 'standard' | 'express' | 'same_day' | 'scheduled';
  requested_at: string; // ISO timestamp
  store_hub_id?: string;
}

export interface PriceBreakdownItem {
  name: string;
  amount: number;
}

export interface ETAWindow {
  min: number;
  max: number;
}

export interface DeliveryOption {
  id: string;
  label: string;
  price_ngn: number;
  price_breakdown: PriceBreakdownItem[];
  estimated_eta_minutes: ETAWindow;
  eta_friendly: string;
  applied_rules: string[];
  tags: string[];
  is_available: boolean;
  suspension_reason?: string;
}

export interface ShipmentFee {
  pickup_location_id: string;
  pickup_zone: string;
  delivery_zone: string;
  distance_km: number;
  fee_breakdown: PriceBreakdownItem[];
  subtotal_ngn: number;
  applied_rules: string[];
}

export interface DeliveryQuoteResponse {
  cart_id: string;
  currency: string;
  effective_weight_kg: number;
  distance_km: number;
  delivery_options: DeliveryOption[];
  per_shipment_fees?: ShipmentFee[];
  grand_total_ngn: number;
}

interface ZoneConfig {
  code: string;
  name: string;
  type: 'polygon' | 'centroid-fallback';
  center: { lat: number; lng: number };
  pricing: {
    base_fee_ngn: number;
    per_km_rate_ngn: number;
    min_fee_ngn: number;
    max_fee_ngn: number;
    free_distance_km: number;
  };
  eta: {
    base_dispatch_minutes: number;
    travel_profile: string;
    congestion_factor: number;
    operational_buffer_percent: number;
    pickup_handling_minutes: { min: number; max: number };
  };
  delivery_types: string[];
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
}

interface RiderAvailability {
  active_riders: number;
  queued_jobs: number;
}

// ============== CONSTANTS ==============

const TRAVEL_PROFILES: Record<string, number> = {
  urban: 2.5,
  inner_city: 3.0,
  suburban: 3.5,
  rural: 5.0
};

const DELIVERY_TYPE_MULTIPLIERS_MAKURDI: Record<string, number> = {
  standard: 1.0,
  express: 1.3,
  same_day: 1.5,
  scheduled: 1.0
};

const DELIVERY_TYPE_MULTIPLIERS_GENERAL: Record<string, number> = {
  standard: 1.0,
  express: 1.5,
  same_day: 2.0,
  scheduled: 1.0
};

const PEAK_HOURS = [
  { start: 7, end: 9 },   // Morning rush
  { start: 16, end: 19 }  // Evening rush
];

// Default settings (overridden by database values)
let DEFAULTS = {
  free_distance_km: 0,
  per_km_rate_ngn: 50,
  base_fee_ngn: 300,
  weight_free_limit_kg: 5,
  weight_surcharge_per_kg: 100,
  platform_commission_percent: 15,
  insurance_threshold_ngn: 50000,
  insurance_rate_percent: 1,
  cod_surcharge_percent: 2,
  default_cross_zone_fee: 150,
  delivery_type_multipliers: {
    standard: 1.0,
    express: 1.3,
    same_day: 1.5
  }
};

// Cache for global settings
let cachedSettings: typeof DEFAULTS | null = null;
let settingsCacheTime: number = 0;
const SETTINGS_CACHE_TTL = 60000; // 1 minute cache

/**
 * Load global delivery settings from database
 */
async function loadGlobalSettings(): Promise<typeof DEFAULTS> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cachedSettings && (now - settingsCacheTime) < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }
  
  try {
    const result = await prisma.$runCommandRaw({
      find: 'delivery_settings',
      filter: { id: 'global' },
      limit: 1
    }) as any;
    
    const settings = result?.cursor?.firstBatch?.[0];
    
    if (settings) {
      cachedSettings = {
        free_distance_km: settings.free_distance_km ?? DEFAULTS.free_distance_km,
        per_km_rate_ngn: settings.per_km_rate_ngn ?? DEFAULTS.per_km_rate_ngn,
        base_fee_ngn: settings.base_fee_ngn ?? DEFAULTS.base_fee_ngn,
        weight_free_limit_kg: DEFAULTS.weight_free_limit_kg,
        weight_surcharge_per_kg: settings.weight_surcharge_per_kg ?? DEFAULTS.weight_surcharge_per_kg,
        platform_commission_percent: settings.platform_commission_percent ?? DEFAULTS.platform_commission_percent,
        insurance_threshold_ngn: settings.min_insurance_threshold ?? DEFAULTS.insurance_threshold_ngn,
        insurance_rate_percent: settings.insurance_rate_percent ?? DEFAULTS.insurance_rate_percent,
        cod_surcharge_percent: DEFAULTS.cod_surcharge_percent,
        default_cross_zone_fee: DEFAULTS.default_cross_zone_fee,
        delivery_type_multipliers: settings.delivery_type_multipliers ?? DEFAULTS.delivery_type_multipliers
      };
      settingsCacheTime = now;
      console.log('📦 Loaded delivery settings from database');
      return cachedSettings;
    }
  } catch (error) {
    console.warn('Failed to load delivery settings, using defaults:', error);
  }
  
  return DEFAULTS;
}

// ============== CORE FUNCTIONS ==============

/**
 * Calculate distance using Haversine formula
 * Returns distance in km rounded to 3 decimal places
 */
export function calculateHaversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 1000) / 1000; // 3 decimal precision
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate effective weight (max of gross and volumetric)
 */
export function calculateEffectiveWeight(items: CartItem[]): number {
  let totalGrossKg = 0;
  let totalVolumetricKg = 0;
  
  for (const item of items) {
    const qty = item.quantity;
    
    // Gross weight
    if (item.weight_kg) {
      totalGrossKg += item.weight_kg * qty;
    }
    
    // Volumetric weight: (L * W * H) / 5000
    if (item.dimensions) {
      const { length_cm, width_cm, height_cm } = item.dimensions;
      const volumetricWeight = (length_cm * width_cm * height_cm) / 5000;
      totalVolumetricKg += volumetricWeight * qty;
    }
  }
  
  const effectiveWeight = Math.max(totalGrossKg, totalVolumetricKg);
  return Math.round(effectiveWeight * 1000) / 1000; // 3 decimal precision
}

/**
 * Determine zone from coordinates
 */
export function determineZone(lat: number, lng: number): ZoneConfig | null {
  // First check Makurdi zones (more specific)
  for (const zone of benueZonesData.makurdi_zones) {
    const distance = calculateHaversineDistance(
      lat, lng,
      zone.center.lat, zone.center.lng
    );
    
    // Makurdi zones have ~5km effective radius
    if (distance <= 5) {
      return zone as ZoneConfig;
    }
  }
  
  // Then check Benue LGA zones
  for (const lga of benueZonesData.benue_lgas) {
    const distance = calculateHaversineDistance(
      lat, lng,
      lga.center.lat, lga.center.lng
    );
    
    if (distance <= lga.radius_km) {
      return lga as ZoneConfig;
    }
  }
  
  return null;
}

/**
 * Get cross-zone fee
 */
export function getCrossZoneFee(fromZone: string, toZone: string): number {
  if (fromZone === toZone) return 0;
  
  const crossZoneFees = benueZonesData.cross_zone_fees as Record<string, Record<string, number> | number>;
  const defaultFee = typeof crossZoneFees.default === 'number' ? crossZoneFees.default : DEFAULTS.default_cross_zone_fee;
  
  // Direct lookup
  const fromZoneFees = crossZoneFees[fromZone];
  if (fromZoneFees && typeof fromZoneFees === 'object' && fromZoneFees[toZone]) {
    return fromZoneFees[toZone];
  }
  
  // Reverse lookup
  const toZoneFees = crossZoneFees[toZone];
  if (toZoneFees && typeof toZoneFees === 'object' && toZoneFees[fromZone]) {
    return toZoneFees[fromZone];
  }
  
  // Default
  return defaultFee;
}

/**
 * Check if current time is during peak hours
 */
export function isPeakHour(timestamp: string): boolean {
  const date = new Date(timestamp);
  const hour = date.getHours();
  
  return PEAK_HOURS.some(peak => hour >= peak.start && hour < peak.end);
}

/**
 * Get traffic multiplier based on time and zone
 */
export function getTrafficMultiplier(timestamp: string, congestionFactor: number): number {
  if (isPeakHour(timestamp)) {
    return 1.0 + congestionFactor;
  }
  return 1.0;
}

/**
 * Calculate rider availability delay
 */
export function calculateRiderDelay(availability: RiderAvailability): number {
  const { active_riders, queued_jobs } = availability;
  
  if (active_riders >= queued_jobs) {
    return 5; // Base 5 minutes
  }
  
  return 5 + (queued_jobs - active_riders) * 4;
}

/**
 * Calculate ETA window
 */
export function calculateETA(
  distanceKm: number,
  zone: ZoneConfig,
  deliveryType: string,
  requestedAt: string,
  riderAvailability: RiderAvailability
): { eta: ETAWindow; friendly: string } {
  const travelProfile = TRAVEL_PROFILES[zone.eta.travel_profile] || 3.0;
  const trafficMultiplier = getTrafficMultiplier(requestedAt, zone.eta.congestion_factor);
  const riderDelay = calculateRiderDelay(riderAvailability);
  const pickupHandling = (zone.eta.pickup_handling_minutes.min + zone.eta.pickup_handling_minutes.max) / 2;
  
  // Base travel time
  let travelMinutes = travelProfile * distanceKm * trafficMultiplier;
  
  // Apply delivery type adjustments
  let riderPenalty = 0;
  if (deliveryType === 'express') {
    travelMinutes *= 0.85;
    riderPenalty = 3;
  } else if (deliveryType === 'same_day') {
    travelMinutes *= 0.80;
    riderPenalty = 5;
  }
  
  const rawEta = zone.eta.base_dispatch_minutes + pickupHandling + riderDelay + riderPenalty + travelMinutes;
  const buffer = rawEta * zone.eta.operational_buffer_percent;
  
  const etaMin = Math.floor(rawEta);
  const etaMax = Math.ceil(rawEta + buffer);
  
  // Format friendly string
  let friendly: string;
  if (etaMax <= 120) {
    friendly = `${etaMin}-${etaMax} mins`;
  } else {
    const hoursMin = Math.floor(etaMin / 60);
    const hoursMax = Math.ceil(etaMax / 60);
    friendly = `${hoursMin}-${hoursMax} hours`;
  }
  
  return {
    eta: { min: etaMin, max: etaMax },
    friendly
  };
}

/**
 * Calculate delivery fee for a single shipment
 */
export async function calculateShipmentFee(
  pickupCoords: { lat: number; lng: number },
  deliveryCoords: { lat: number; lng: number },
  effectiveWeightKg: number,
  packageValueNgn: number,
  deliveryType: string,
  paymentMethod: string,
  isMakurdi: boolean,
  settings?: typeof DEFAULTS
): Promise<{ breakdown: PriceBreakdownItem[]; subtotal: number; appliedRules: string[] }> {
  // Load settings if not provided
  const globalSettings = settings || await loadGlobalSettings();
  const appliedRules: string[] = [];
  const breakdown: PriceBreakdownItem[] = [];
  
  // Determine zones
  const pickupZone = determineZone(pickupCoords.lat, pickupCoords.lng);
  const deliveryZone = determineZone(deliveryCoords.lat, deliveryCoords.lng);
  
  // Calculate distance
  const distanceKm = calculateHaversineDistance(
    pickupCoords.lat, pickupCoords.lng,
    deliveryCoords.lat, deliveryCoords.lng
  );
  
  // Determine pricing config
  let baseFee: number;
  let perKmRate: number;
  let minFee: number;
  let maxFee: number;
  let freeDistanceKm: number = 0;
  
  if (deliveryZone) {
    // Use zone-specific pricing, but fall back to global settings if zone pricing is 0
    baseFee = deliveryZone.pricing.base_fee_ngn || globalSettings.base_fee_ngn;
    perKmRate = deliveryZone.pricing.per_km_rate_ngn || globalSettings.per_km_rate_ngn;
    minFee = deliveryZone.pricing.min_fee_ngn || 300;
    maxFee = deliveryZone.pricing.max_fee_ngn || 10000;
    freeDistanceKm = deliveryZone.pricing.free_distance_km ?? globalSettings.free_distance_km;
    appliedRules.push(`zone_${deliveryZone.code}_base`);
  } else {
    // Benue-wide fallback using global settings
    baseFee = globalSettings.base_fee_ngn;
    perKmRate = globalSettings.per_km_rate_ngn;
    freeDistanceKm = globalSettings.free_distance_km;
    minFee = 300;
    maxFee = 10000;
    appliedRules.push('benue_fallback');
  }
  
  breakdown.push({ name: 'Base Fee', amount: Math.round(baseFee) });
  
  // Distance fee (billable_km = distance_km - free_distance_km)
  const billableKm = Math.max(0, distanceKm - freeDistanceKm);
  const distanceFee = billableKm * perKmRate;
  if (distanceFee > 0) {
    breakdown.push({ 
      name: `Distance Fee (${billableKm.toFixed(2)}km)`, 
      amount: Math.round(distanceFee) 
    });
    appliedRules.push('distance_fee');
  }
  
  // Weight fee (free up to 5kg, then per-kg surcharge)
  let weightFee = 0;
  if (effectiveWeightKg > globalSettings.weight_free_limit_kg) {
    weightFee = (effectiveWeightKg - globalSettings.weight_free_limit_kg) * globalSettings.weight_surcharge_per_kg;
    breakdown.push({ 
      name: `Weight Surcharge (${(effectiveWeightKg - globalSettings.weight_free_limit_kg).toFixed(1)}kg)`, 
      amount: Math.round(weightFee) 
    });
    appliedRules.push('weight_surcharge');
  }
  
  // Cross-zone fee
  let crossZoneFee = 0;
  if (pickupZone && deliveryZone && pickupZone.code !== deliveryZone.code) {
    crossZoneFee = getCrossZoneFee(pickupZone.code, deliveryZone.code);
    breakdown.push({ name: 'Cross-Zone Fee', amount: Math.round(crossZoneFee) });
    appliedRules.push('cross_zone_fee');
  }
  
  // Calculate subtotal before multipliers
  let subtotal = baseFee + distanceFee + weightFee + crossZoneFee;
  
  // Apply delivery type multiplier from global settings or defaults
  const typeMultiplier = globalSettings.delivery_type_multipliers[deliveryType as keyof typeof globalSettings.delivery_type_multipliers] 
    || (isMakurdi ? DELIVERY_TYPE_MULTIPLIERS_MAKURDI : DELIVERY_TYPE_MULTIPLIERS_GENERAL)[deliveryType] 
    || 1.0;
  
  if (typeMultiplier !== 1.0) {
    const multiplierFee = subtotal * (typeMultiplier - 1);
    breakdown.push({ 
      name: `${deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)} Surcharge (${((typeMultiplier - 1) * 100).toFixed(0)}%)`, 
      amount: Math.round(multiplierFee) 
    });
    subtotal *= typeMultiplier;
    appliedRules.push(`multiplier_${deliveryType}`);
  }
  
  // Insurance fee for high-value packages
  let insuranceFee = 0;
  if (packageValueNgn > globalSettings.insurance_threshold_ngn) {
    insuranceFee = packageValueNgn * (globalSettings.insurance_rate_percent / 100);
    breakdown.push({ name: `Insurance (${globalSettings.insurance_rate_percent}%)`, amount: Math.round(insuranceFee) });
    appliedRules.push('insurance');
  }
  
  // COD surcharge (for General Backend only)
  let codFee = 0;
  if (!isMakurdi && paymentMethod === 'cod') {
    codFee = packageValueNgn * (globalSettings.cod_surcharge_percent / 100);
    breakdown.push({ name: `COD Surcharge (${globalSettings.cod_surcharge_percent}%)`, amount: Math.round(codFee) });
    appliedRules.push('cod_surcharge');
  }
  
  // Platform fee
  const platformFee = subtotal * (globalSettings.platform_commission_percent / 100);
  breakdown.push({ 
    name: `Platform Fee (${globalSettings.platform_commission_percent}%)`, 
    amount: Math.round(platformFee) 
  });
  appliedRules.push('platform_fee');
  
  // Calculate total
  let total = subtotal + insuranceFee + codFee + platformFee;
  
  // Apply min/max caps
  total = Math.max(total, minFee);
  if (maxFee) {
    total = Math.min(total, maxFee);
  }
  
  // Round to nearest Naira
  total = Math.round(total);
  
  return {
    breakdown,
    subtotal: total,
    appliedRules
  };
}

// ============== MAIN QUOTE FUNCTION ==============

export async function getDeliveryQuote(request: DeliveryQuoteRequest): Promise<DeliveryQuoteResponse> {
  const {
    cart_id,
    subtotal_ngn,
    items,
    payment_method,
    delivery_coords,
    delivery_type,
    requested_at
  } = request;
  
  // Calculate effective weight
  const effectiveWeightKg = calculateEffectiveWeight(items);
  
  // Group items by pickup location
  const pickupGroups = new Map<string, CartItem[]>();
  for (const item of items) {
    const key = item.pickup_location_id;
    if (!pickupGroups.has(key)) {
      pickupGroups.set(key, []);
    }
    pickupGroups.get(key)!.push(item);
  }
  
  // Sort pickup location IDs deterministically
  const sortedPickupIds = Array.from(pickupGroups.keys()).sort();
  
  // Check if delivery is within Makurdi
  const deliveryZone = determineZone(delivery_coords.lat, delivery_coords.lng);
  const isMakurdi = deliveryZone?.code.startsWith('MKD-') || false;
  
  // Calculate per-shipment fees
  const perShipmentFees: ShipmentFee[] = [];
  let totalDistance = 0;
  let grandTotal = 0;
  const allAppliedRules: string[] = [];
  
  // Get rider availability (would come from DB in production)
  const riderAvailability: RiderAvailability = {
    active_riders: 5,
    queued_jobs: 3
  };
  
  for (const pickupId of sortedPickupIds) {
    const groupItems = pickupGroups.get(pickupId)!;
    
    // Get pickup coords (from first item or default)
    const firstItem = groupItems[0];
    const pickupCoords = firstItem.pickup_coords || request.pickup_coords || {
      lat: 7.7333, lng: 8.5333 // Default to Makurdi center
    };
    
    // Calculate group weight and value
    const groupWeight = calculateEffectiveWeight(groupItems);
    const groupValue = groupItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate distance
    const distanceKm = calculateHaversineDistance(
      pickupCoords.lat, pickupCoords.lng,
      delivery_coords.lat, delivery_coords.lng
    );
    totalDistance += distanceKm;
    
    // Calculate fees (now async to load global settings)
    const { breakdown, subtotal, appliedRules } = await calculateShipmentFee(
      pickupCoords,
      delivery_coords,
      groupWeight,
      groupValue,
      delivery_type,
      payment_method,
      isMakurdi
    );
    
    grandTotal += subtotal;
    allAppliedRules.push(...appliedRules);
    
    // Determine zones
    const pickupZone = determineZone(pickupCoords.lat, pickupCoords.lng);
    
    perShipmentFees.push({
      pickup_location_id: pickupId,
      pickup_zone: pickupZone?.code || 'UNKNOWN',
      delivery_zone: deliveryZone?.code || 'UNKNOWN',
      distance_km: distanceKm,
      fee_breakdown: breakdown,
      subtotal_ngn: subtotal,
      applied_rules: appliedRules
    });
  }
  
  // Calculate combined ETA
  let combinedEtaMin = Infinity;
  let combinedEtaMax = 0;
  
  for (const shipment of perShipmentFees) {
    const zone = determineZone(delivery_coords.lat, delivery_coords.lng) || {
      eta: {
        base_dispatch_minutes: 45,
        travel_profile: 'suburban',
        congestion_factor: 0.2,
        operational_buffer_percent: 0.2,
        pickup_handling_minutes: { min: 5, max: 15 }
      }
    } as ZoneConfig;
    
    const { eta } = calculateETA(
      shipment.distance_km,
      zone,
      delivery_type,
      requested_at,
      riderAvailability
    );
    
    combinedEtaMin = Math.min(combinedEtaMin, eta.min);
    combinedEtaMax = Math.max(combinedEtaMax, eta.max);
  }
  
  // Format combined ETA
  let combinedEtaFriendly: string;
  if (combinedEtaMax <= 120) {
    combinedEtaFriendly = `${combinedEtaMin}-${combinedEtaMax} mins`;
  } else {
    const hoursMin = Math.floor(combinedEtaMin / 60);
    const hoursMax = Math.ceil(combinedEtaMax / 60);
    combinedEtaFriendly = `${hoursMin}-${hoursMax} hours`;
  }
  
  // Check for free shipping
  const freeShippingThreshold = 50000;
  const hasFreeShipping = subtotal_ngn > freeShippingThreshold;
  
  // Check if zone is suspended
  const isSuspended = deliveryZone?.is_suspended || false;
  
  // Build delivery options
  const deliveryOptions: DeliveryOption[] = [];
  
  // Primary option
  const primaryOption: DeliveryOption = {
    id: delivery_type,
    label: `${delivery_type.charAt(0).toUpperCase() + delivery_type.slice(1).replace('_', ' ')} Delivery`,
    price_ngn: hasFreeShipping ? 0 : grandTotal,
    price_breakdown: perShipmentFees.length === 1 
      ? perShipmentFees[0].fee_breakdown 
      : [{ name: 'Combined Shipments', amount: grandTotal }],
    estimated_eta_minutes: { min: combinedEtaMin, max: combinedEtaMax },
    eta_friendly: combinedEtaFriendly,
    applied_rules: [...new Set(allAppliedRules)].sort(),
    tags: hasFreeShipping ? ['free_shipping'] : (delivery_type === 'standard' ? ['recommended'] : []),
    is_available: !isSuspended && (deliveryZone?.delivery_types.includes(delivery_type) ?? true)
  };
  
  if (isSuspended) {
    primaryOption.suspension_reason = deliveryZone?.suspension_reason || 'Area temporarily unavailable';
  }
  
  deliveryOptions.push(primaryOption);
  
  // Add alternative options if available
  const alternativeTypes = ['standard', 'express', 'same_day'].filter(t => t !== delivery_type);
  for (const altType of alternativeTypes) {
    if (deliveryZone?.delivery_types.includes(altType) ?? true) {
      const { breakdown, subtotal } = calculateShipmentFee(
        request.pickup_coords || { lat: 7.7333, lng: 8.5333 },
        delivery_coords,
        effectiveWeightKg,
        subtotal_ngn,
        altType,
        payment_method,
        isMakurdi
      );
      
      const { eta, friendly } = calculateETA(
        totalDistance / Math.max(1, perShipmentFees.length),
        deliveryZone || {
          eta: {
            base_dispatch_minutes: 45,
            travel_profile: 'suburban',
            congestion_factor: 0.2,
            operational_buffer_percent: 0.2,
            pickup_handling_minutes: { min: 5, max: 15 }
          }
        } as ZoneConfig,
        altType,
        requested_at,
        riderAvailability
      );
      
      deliveryOptions.push({
        id: altType,
        label: `${altType.charAt(0).toUpperCase() + altType.slice(1).replace('_', ' ')} Delivery`,
        price_ngn: hasFreeShipping ? 0 : subtotal,
        price_breakdown: breakdown,
        estimated_eta_minutes: eta,
        eta_friendly: friendly,
        applied_rules: [],
        tags: altType === 'standard' ? ['recommended'] : [],
        is_available: !isSuspended
      });
    }
  }
  
  return {
    cart_id,
    currency: 'NGN',
    effective_weight_kg: effectiveWeightKg,
    distance_km: Math.round((totalDistance / Math.max(1, perShipmentFees.length)) * 1000) / 1000,
    delivery_options: deliveryOptions,
    per_shipment_fees: perShipmentFees.length > 1 ? perShipmentFees : undefined,
    grand_total_ngn: hasFreeShipping ? 0 : grandTotal
  };
}

// ============== FRONTEND FALLBACK ==============

export function getFallbackDeliveryFee(subtotalNgn: number): { fee: number; isFree: boolean } {
  if (subtotalNgn > 50000) {
    return { fee: 0, isFree: true };
  }
  return { fee: 2500, isFree: false };
}

export function calculateVAT(subtotalNgn: number): number {
  return Math.round(subtotalNgn * 0.075); // 7.5% VAT
}
