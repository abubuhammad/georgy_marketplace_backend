/**
 * Delivery Quote Routes
 * 
 * POST /delivery-quote - Get delivery quote for cart
 * GET /zones - Get all delivery zones
 * POST /admin/suspend-area - Suspend a delivery zone
 * POST /admin/area-resume - Resume a suspended zone
 * POST /admin/import-zones - Import zones from GeoJSON/CSV
 * GET /admin/preview-rule - Preview quote with dry-run
 * GET /audit/quotes - Get quote audit log
 */

import { Router, Request, Response } from 'express';
import { 
  getDeliveryQuote, 
  DeliveryQuoteRequest,
  getFallbackDeliveryFee,
  calculateVAT
} from '../services/delivery/deliveryQuoteService';
import { AdminDeliveryService } from '../services/delivery/adminDeliveryService';

const router = Router();

// ============== PUBLIC ROUTES ==============

/**
 * POST /delivery-quote
 * Get delivery quote for a cart
 */
router.post('/delivery-quote', async (req: Request, res: Response) => {
  try {
    const request: DeliveryQuoteRequest = {
      cart_id: req.body.cart_id,
      subtotal_ngn: req.body.subtotal_ngn,
      items: req.body.items || [],
      payment_method: req.body.payment_method || 'card',
      pickup_coords: req.body.pickup_coords,
      delivery_coords: req.body.delivery_coords,
      delivery_type: req.body.delivery_type || 'standard',
      requested_at: req.body.requested_at || new Date().toISOString(),
      store_hub_id: req.body.store_hub_id
    };
    
    // Validate required fields
    if (!request.cart_id) {
      return res.status(400).json({ error: 'cart_id is required' });
    }
    if (!request.delivery_coords?.lat || !request.delivery_coords?.lng) {
      return res.status(400).json({ error: 'delivery_coords (lat, lng) are required' });
    }
    
    const quote = await getDeliveryQuote(request);
    
    // Log quote for auditing
    await AdminDeliveryService.logQuote(quote, request).catch(console.error);
    
    res.json(quote);
  } catch (error: any) {
    console.error('Error generating delivery quote:', error);
    
    // Return fallback quote on error
    const subtotal = req.body.subtotal_ngn || 0;
    const fallback = getFallbackDeliveryFee(subtotal);
    
    res.json({
      cart_id: req.body.cart_id,
      currency: 'NGN',
      effective_weight_kg: 0,
      distance_km: 0,
      delivery_options: [
        {
          id: 'fallback',
          label: 'Standard Delivery',
          price_ngn: fallback.fee,
          price_breakdown: [
            { name: fallback.isFree ? 'Free Shipping' : 'Flat Rate', amount: fallback.fee }
          ],
          estimated_eta_minutes: { min: 45, max: 90 },
          eta_friendly: '45-90 mins',
          applied_rules: ['frontend_fallback'],
          tags: fallback.isFree ? ['free_shipping'] : [],
          is_available: true
        }
      ],
      grand_total_ngn: fallback.fee,
      _error: error.message,
      _fallback: true
    });
  }
});

/**
 * GET /zones
 * Get all delivery zones
 */
router.get('/zones', async (req: Request, res: Response) => {
  try {
    const includeSuspended = req.query.include_suspended === 'true';
    const zones = await AdminDeliveryService.getZones(includeSuspended);
    
    res.json({
      success: true,
      zones,
      count: zones.length
    });
  } catch (error: any) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /zones/:code
 * Get a specific zone by code
 */
router.get('/zones/:code', async (req: Request, res: Response) => {
  try {
    const zones = await AdminDeliveryService.getZones(true);
    const zone = zones.find(z => z.code === req.params.code);
    
    if (!zone) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }
    
    res.json({ success: true, zone });
  } catch (error: any) {
    console.error('Error fetching zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== ADMIN ROUTES ==============

/**
 * POST /admin/suspend-area
 * Suspend a delivery zone
 */
router.post('/admin/suspend-area', async (req: Request, res: Response) => {
  try {
    const { zone_code, reason } = req.body;
    
    if (!zone_code) {
      return res.status(400).json({ error: 'zone_code is required' });
    }
    if (!reason) {
      return res.status(400).json({ error: 'reason is required' });
    }
    
    const result = await AdminDeliveryService.suspendZone(zone_code, reason);
    res.json(result);
  } catch (error: any) {
    console.error('Error suspending zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /admin/area-resume
 * Resume a suspended zone
 */
router.post('/admin/area-resume', async (req: Request, res: Response) => {
  try {
    const { zone_code } = req.body;
    
    if (!zone_code) {
      return res.status(400).json({ error: 'zone_code is required' });
    }
    
    const result = await AdminDeliveryService.resumeZone(zone_code);
    res.json(result);
  } catch (error: any) {
    console.error('Error resuming zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /admin/import-zones
 * Import zones from GeoJSON or CSV
 */
router.post('/admin/import-zones', async (req: Request, res: Response) => {
  try {
    const { format, data, options } = req.body;
    
    if (!format || !['geojson', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'format must be "geojson" or "csv"' });
    }
    if (!data) {
      return res.status(400).json({ error: 'data is required' });
    }
    
    const result = await AdminDeliveryService.importZones({ format, data, options });
    res.json(result);
  } catch (error: any) {
    console.error('Error importing zones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /admin/preview-rule
 * Preview a delivery quote (dry-run)
 */
router.get('/admin/preview-rule', async (req: Request, res: Response) => {
  try {
    // Parse cart from query string (JSON encoded)
    const cartParam = req.query.cart as string;
    if (!cartParam) {
      return res.status(400).json({ error: 'cart query parameter is required (JSON encoded)' });
    }
    
    let cart;
    try {
      cart = JSON.parse(decodeURIComponent(cartParam));
    } catch (e) {
      return res.status(400).json({ error: 'Invalid cart JSON' });
    }
    
    const result = await AdminDeliveryService.previewQuote(cart);
    res.json({
      success: true,
      preview: true,
      quote: result
    });
  } catch (error: any) {
    console.error('Error previewing quote:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /admin/preview-quote
 * Preview a delivery quote (dry-run) - POST version for complex carts
 */
router.post('/admin/preview-quote', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.previewQuote(req.body);
    res.json({
      success: true,
      preview: true,
      quote: result
    });
  } catch (error: any) {
    console.error('Error previewing quote:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /audit/quotes
 * Get quote audit log
 */
router.get('/audit/quotes', async (req: Request, res: Response) => {
  try {
    const options = {
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      zone: req.query.zone as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };
    
    const result = await AdminDeliveryService.getQuoteAuditLog(options);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== ZONE MANAGEMENT ==============

/**
 * POST /admin/zones
 * Create a new zone
 */
router.post('/admin/zones', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.createZone(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error creating zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /admin/zones/:code
 * Update a zone
 */
router.patch('/admin/zones/:code', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.updateZone(req.params.code, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /admin/zones/:code
 * Delete a zone (soft delete)
 */
router.delete('/admin/zones/:code', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.deleteZone(req.params.code);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== RIDER AVAILABILITY ==============

/**
 * GET /admin/rider-availability
 * Get rider availability for all zones
 */
router.get('/admin/rider-availability', async (req: Request, res: Response) => {
  try {
    const availability = await AdminDeliveryService.getRiderAvailability();
    res.json({ success: true, availability });
  } catch (error: any) {
    console.error('Error fetching rider availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /admin/rider-availability
 * Update rider availability for zones
 */
router.post('/admin/rider-availability', async (req: Request, res: Response) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [req.body];
    const result = await AdminDeliveryService.updateRiderAvailability(updates);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating rider availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== PRICING RULES ==============

/**
 * GET /admin/pricing-rules
 * Get all pricing rules
 */
router.get('/admin/pricing-rules', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const rules = await AdminDeliveryService.getPricingRules(includeInactive);
    res.json({ success: true, rules });
  } catch (error: any) {
    console.error('Error fetching pricing rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /admin/pricing-rules
 * Create a pricing rule
 */
router.post('/admin/pricing-rules', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.createPricingRule(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error creating pricing rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /admin/pricing-rules/:id
 * Update a pricing rule
 */
router.patch('/admin/pricing-rules/:id', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.updatePricingRule(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating pricing rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /admin/pricing-rules/:id
 * Delete a pricing rule
 */
router.delete('/admin/pricing-rules/:id', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.deletePricingRule(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting pricing rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== GLOBAL SETTINGS ==============

/**
 * GET /admin/settings
 * Get global delivery settings
 */
router.get('/admin/settings', async (req: Request, res: Response) => {
  try {
    const settings = await AdminDeliveryService.getGlobalSettings();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /admin/settings
 * Update global delivery settings
 */
router.put('/admin/settings', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.updateGlobalSettings(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /admin/zones/:code/suspend
 * Suspend a specific zone
 */
router.post('/admin/zones/:code/suspend', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const result = await AdminDeliveryService.suspendZone(req.params.code, reason || 'Admin suspended');
    res.json(result);
  } catch (error: any) {
    console.error('Error suspending zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /admin/zones/:code/resume
 * Resume a suspended zone
 */
router.post('/admin/zones/:code/resume', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.resumeZone(req.params.code);
    res.json(result);
  } catch (error: any) {
    console.error('Error resuming zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /admin/zones/:code
 * Update a zone (PUT version for frontend compatibility)
 */
router.put('/admin/zones/:code', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.updateZone(req.params.code, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating zone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== ZONE CONFIGURATION ==============

/**
 * PATCH /admin/zones/:code/travel-profile
 * Update zone travel profile
 */
router.patch('/admin/zones/:code/travel-profile', async (req: Request, res: Response) => {
  try {
    const result = await AdminDeliveryService.updateZoneTravelProfile(req.params.code, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating travel profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /admin/zones/:code/delivery-types
 * Toggle delivery type for a zone
 */
router.patch('/admin/zones/:code/delivery-types', async (req: Request, res: Response) => {
  try {
    const { delivery_type, enabled } = req.body;
    
    if (!delivery_type) {
      return res.status(400).json({ error: 'delivery_type is required' });
    }
    if (enabled === undefined) {
      return res.status(400).json({ error: 'enabled is required' });
    }
    
    const result = await AdminDeliveryService.toggleDeliveryType(
      req.params.code, 
      delivery_type, 
      enabled
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error toggling delivery type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
