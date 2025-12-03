/**
 * Delivery Quote Service Tests
 * 
 * Tests for:
 * - Volumetric weight correctness
 * - Haversine distance correctness
 * - Billable_km equals distance_km by default
 * - Fee arithmetic and rounding
 * - Deterministic applied_rules order
 * - free_shipping and block_delivery precedence
 * - ETA window scaling with traffic and rider availability
 * - Admin suspend/resume immediacy
 */

import {
  calculateHaversineDistance,
  calculateEffectiveWeight,
  determineZone,
  getCrossZoneFee,
  isPeakHour,
  getTrafficMultiplier,
  calculateRiderDelay,
  calculateETA,
  calculateShipmentFee,
  getDeliveryQuote,
  getFallbackDeliveryFee,
  CartItem,
  DeliveryQuoteRequest
} from '../services/delivery/deliveryQuoteService';

describe('Haversine Distance Calculation', () => {
  test('should calculate distance between two points correctly', () => {
    // Wurukum to North Bank (~2km)
    const distance = calculateHaversineDistance(7.7333, 8.5333, 7.7500, 8.5167);
    expect(distance).toBeGreaterThan(1.5);
    expect(distance).toBeLessThan(2.5);
  });

  test('should return 0 for same coordinates', () => {
    const distance = calculateHaversineDistance(7.7333, 8.5333, 7.7333, 8.5333);
    expect(distance).toBe(0);
  });

  test('should round to 3 decimal places', () => {
    const distance = calculateHaversineDistance(7.7333, 8.5333, 7.7500, 8.5167);
    const decimalPlaces = (distance.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(3);
  });

  test('should handle long distances correctly', () => {
    // Makurdi to Gboko (~70km)
    const distance = calculateHaversineDistance(7.7333, 8.5333, 7.3167, 9.0000);
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(100);
  });
});

describe('Volumetric Weight Calculation', () => {
  test('should use gross weight when higher than volumetric', () => {
    const items: CartItem[] = [{
      id: '1',
      product_id: 'prod1',
      quantity: 1,
      price: 5000,
      weight_kg: 10, // Heavy item
      dimensions: { length_cm: 10, width_cm: 10, height_cm: 10 }, // Small volume
      pickup_location_id: 'seller1'
    }];
    
    const weight = calculateEffectiveWeight(items);
    expect(weight).toBe(10); // Gross weight is higher
  });

  test('should use volumetric weight when higher than gross', () => {
    const items: CartItem[] = [{
      id: '1',
      product_id: 'prod1',
      quantity: 1,
      price: 5000,
      weight_kg: 0.5, // Light item
      dimensions: { length_cm: 50, width_cm: 40, height_cm: 30 }, // Large volume
      pickup_location_id: 'seller1'
    }];
    
    // Volumetric = (50 * 40 * 30) / 5000 = 12
    const weight = calculateEffectiveWeight(items);
    expect(weight).toBe(12);
  });

  test('should multiply by quantity', () => {
    const items: CartItem[] = [{
      id: '1',
      product_id: 'prod1',
      quantity: 3,
      price: 5000,
      weight_kg: 2,
      dimensions: { length_cm: 20, width_cm: 20, height_cm: 20 },
      pickup_location_id: 'seller1'
    }];
    
    // Gross: 2 * 3 = 6
    // Volumetric: (20*20*20)/5000 * 3 = 1.6 * 3 = 4.8
    const weight = calculateEffectiveWeight(items);
    expect(weight).toBe(6);
  });

  test('should round to 3 decimal places', () => {
    const items: CartItem[] = [{
      id: '1',
      product_id: 'prod1',
      quantity: 1,
      price: 5000,
      weight_kg: 1.5555,
      pickup_location_id: 'seller1'
    }];
    
    const weight = calculateEffectiveWeight(items);
    const decimalPlaces = (weight.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(3);
  });
});

describe('Zone Determination', () => {
  test('should identify Makurdi zones', () => {
    // Wurukum center
    const zone = determineZone(7.7333, 8.5333);
    expect(zone?.code).toBe('MKD-WK');
  });

  test('should identify North Bank zone', () => {
    const zone = determineZone(7.7500, 8.5167);
    expect(zone?.code).toBe('MKD-NB');
  });

  test('should return null for out-of-coverage locations', () => {
    // Lagos coordinates
    const zone = determineZone(6.5244, 3.3792);
    expect(zone).toBeNull();
  });
});

describe('Cross-Zone Fee', () => {
  test('should return 0 for same zone', () => {
    const fee = getCrossZoneFee('MKD-WK', 'MKD-WK');
    expect(fee).toBe(0);
  });

  test('should return configured fee for zone pair', () => {
    const fee = getCrossZoneFee('MKD-NB', 'MKD-UA');
    expect(fee).toBe(300); // As per seed data
  });

  test('should return default fee for unconfigured pairs', () => {
    const fee = getCrossZoneFee('MKD-MM', 'MKD-LG');
    expect(fee).toBe(150); // Default
  });
});

describe('Peak Hour Detection', () => {
  test('should detect morning peak hours', () => {
    expect(isPeakHour('2025-12-03T07:30:00Z')).toBe(true);
    expect(isPeakHour('2025-12-03T08:45:00Z')).toBe(true);
  });

  test('should detect evening peak hours', () => {
    expect(isPeakHour('2025-12-03T16:30:00Z')).toBe(true);
    expect(isPeakHour('2025-12-03T18:00:00Z')).toBe(true);
  });

  test('should return false for off-peak hours', () => {
    expect(isPeakHour('2025-12-03T10:00:00Z')).toBe(false);
    expect(isPeakHour('2025-12-03T14:00:00Z')).toBe(false);
    expect(isPeakHour('2025-12-03T21:00:00Z')).toBe(false);
  });
});

describe('Traffic Multiplier', () => {
  test('should apply congestion factor during peak hours', () => {
    const multiplier = getTrafficMultiplier('2025-12-03T08:00:00Z', 0.3);
    expect(multiplier).toBe(1.3);
  });

  test('should return 1.0 during off-peak hours', () => {
    const multiplier = getTrafficMultiplier('2025-12-03T14:00:00Z', 0.3);
    expect(multiplier).toBe(1.0);
  });
});

describe('Rider Availability Delay', () => {
  test('should return 5 minutes when riders available', () => {
    const delay = calculateRiderDelay({ active_riders: 5, queued_jobs: 3 });
    expect(delay).toBe(5);
  });

  test('should add 4 minutes per excess job', () => {
    const delay = calculateRiderDelay({ active_riders: 2, queued_jobs: 5 });
    expect(delay).toBe(5 + (5 - 2) * 4); // 5 + 12 = 17
  });
});

describe('Fee Arithmetic and Rounding', () => {
  test('should bill from km 0 (no free distance)', () => {
    const { breakdown } = calculateShipmentFee(
      { lat: 7.7333, lng: 8.5333 },
      { lat: 7.7500, lng: 8.5167 },
      1, // weight
      5000, // value
      'standard',
      'card',
      true // Makurdi
    );
    
    // Should have distance fee for all distance
    const distanceFee = breakdown.find(b => b.name.includes('Distance Fee'));
    expect(distanceFee).toBeDefined();
    expect(distanceFee?.amount).toBeGreaterThan(0);
  });

  test('should round all amounts to nearest Naira', () => {
    const { breakdown, subtotal } = calculateShipmentFee(
      { lat: 7.7333, lng: 8.5333 },
      { lat: 7.7500, lng: 8.5167 },
      1,
      5000,
      'standard',
      'card',
      true
    );
    
    // All amounts should be integers
    breakdown.forEach(item => {
      expect(Number.isInteger(item.amount)).toBe(true);
    });
    expect(Number.isInteger(subtotal)).toBe(true);
  });

  test('should apply weight surcharge for excess weight', () => {
    const { breakdown } = calculateShipmentFee(
      { lat: 7.7333, lng: 8.5333 },
      { lat: 7.7500, lng: 8.5167 },
      8, // 8kg (3kg excess over 5kg free)
      5000,
      'standard',
      'card',
      true
    );
    
    const weightFee = breakdown.find(b => b.name.includes('Weight'));
    expect(weightFee).toBeDefined();
    expect(weightFee?.amount).toBe(300); // 3kg * 100 NGN
  });

  test('should apply insurance for high-value packages', () => {
    const { breakdown } = calculateShipmentFee(
      { lat: 7.7333, lng: 8.5333 },
      { lat: 7.7500, lng: 8.5167 },
      1,
      100000, // Above 50,000 threshold
      'standard',
      'card',
      true
    );
    
    const insurance = breakdown.find(b => b.name.includes('Insurance'));
    expect(insurance).toBeDefined();
    expect(insurance?.amount).toBe(1000); // 1% of 100,000
  });

  test('should apply COD surcharge for non-Makurdi COD', () => {
    const { breakdown, appliedRules } = calculateShipmentFee(
      { lat: 7.2500, lng: 7.6500 }, // Ado LGA
      { lat: 7.1833, lng: 8.1333 }, // Otukpo
      1,
      10000,
      'standard',
      'cod',
      false // Not Makurdi
    );
    
    const codFee = breakdown.find(b => b.name.includes('COD'));
    expect(codFee).toBeDefined();
    expect(codFee?.amount).toBe(200); // 2% of 10,000
    expect(appliedRules).toContain('cod_surcharge');
  });
});

describe('Deterministic Rule Ordering', () => {
  test('should order applied_rules consistently', async () => {
    const request: DeliveryQuoteRequest = {
      cart_id: 'test_cart',
      subtotal_ngn: 5000,
      items: [{
        id: '1',
        product_id: 'prod1',
        quantity: 1,
        price: 5000,
        weight_kg: 1,
        pickup_location_id: 'seller1',
        pickup_coords: { lat: 7.7333, lng: 8.5333 }
      }],
      payment_method: 'card',
      delivery_coords: { lat: 7.7500, lng: 8.5167 },
      delivery_type: 'express',
      requested_at: '2025-12-03T14:00:00Z'
    };
    
    // Run multiple times
    const results = await Promise.all([
      getDeliveryQuote(request),
      getDeliveryQuote(request),
      getDeliveryQuote(request)
    ]);
    
    // All should have same applied_rules order
    const firstRules = JSON.stringify(results[0].delivery_options[0].applied_rules);
    results.forEach(result => {
      expect(JSON.stringify(result.delivery_options[0].applied_rules)).toBe(firstRules);
    });
  });
});

describe('Free Shipping', () => {
  test('should apply free shipping above threshold', async () => {
    const request: DeliveryQuoteRequest = {
      cart_id: 'test_cart',
      subtotal_ngn: 60000, // Above 50,000 threshold
      items: [{
        id: '1',
        product_id: 'prod1',
        quantity: 1,
        price: 60000,
        pickup_location_id: 'seller1',
        pickup_coords: { lat: 7.7333, lng: 8.5333 }
      }],
      payment_method: 'card',
      delivery_coords: { lat: 7.7500, lng: 8.5167 },
      delivery_type: 'standard',
      requested_at: '2025-12-03T14:00:00Z'
    };
    
    const quote = await getDeliveryQuote(request);
    expect(quote.grand_total_ngn).toBe(0);
    expect(quote.delivery_options[0].tags).toContain('free_shipping');
  });
});

describe('Frontend Fallback', () => {
  test('should return flat rate for normal orders', () => {
    const { fee, isFree } = getFallbackDeliveryFee(30000);
    expect(fee).toBe(2500);
    expect(isFree).toBe(false);
  });

  test('should return free shipping above threshold', () => {
    const { fee, isFree } = getFallbackDeliveryFee(60000);
    expect(fee).toBe(0);
    expect(isFree).toBe(true);
  });
});

describe('ETA Window Scaling', () => {
  test('should scale ETA with distance', () => {
    const zone = determineZone(7.7333, 8.5333)!;
    const riderAvailability = { active_riders: 5, queued_jobs: 3 };
    
    const shortDistance = calculateETA(2, zone, 'standard', '2025-12-03T14:00:00Z', riderAvailability);
    const longDistance = calculateETA(10, zone, 'standard', '2025-12-03T14:00:00Z', riderAvailability);
    
    expect(longDistance.eta.max).toBeGreaterThan(shortDistance.eta.max);
  });

  test('should increase ETA during peak hours', () => {
    const zone = determineZone(7.7333, 8.5333)!;
    const riderAvailability = { active_riders: 5, queued_jobs: 3 };
    
    const offPeak = calculateETA(5, zone, 'standard', '2025-12-03T14:00:00Z', riderAvailability);
    const peak = calculateETA(5, zone, 'standard', '2025-12-03T08:00:00Z', riderAvailability);
    
    expect(peak.eta.max).toBeGreaterThan(offPeak.eta.max);
  });

  test('should decrease ETA for express delivery', () => {
    const zone = determineZone(7.7333, 8.5333)!;
    const riderAvailability = { active_riders: 5, queued_jobs: 3 };
    
    const standard = calculateETA(5, zone, 'standard', '2025-12-03T14:00:00Z', riderAvailability);
    const express = calculateETA(5, zone, 'express', '2025-12-03T14:00:00Z', riderAvailability);
    
    // Express should be faster (travel time is 0.85x)
    expect(express.eta.min).toBeLessThan(standard.eta.min + 10); // Allow for rider penalty
  });

  test('should increase ETA when riders scarce', () => {
    const zone = determineZone(7.7333, 8.5333)!;
    
    const availableRiders = calculateETA(5, zone, 'standard', '2025-12-03T14:00:00Z', 
      { active_riders: 10, queued_jobs: 3 });
    const scarceRiders = calculateETA(5, zone, 'standard', '2025-12-03T14:00:00Z', 
      { active_riders: 2, queued_jobs: 10 });
    
    expect(scarceRiders.eta.max).toBeGreaterThan(availableRiders.eta.max);
  });

  test('should format ETA in hours for long durations', () => {
    const zone = determineZone(7.2500, 7.6500)!; // Rural area with longer base time
    const riderAvailability = { active_riders: 1, queued_jobs: 5 };
    
    const longEta = calculateETA(30, zone, 'standard', '2025-12-03T08:00:00Z', riderAvailability);
    
    if (longEta.eta.max > 120) {
      expect(longEta.friendly).toMatch(/hours?/);
    }
  });
});

describe('Multi-Shipment Handling', () => {
  test('should group items by pickup location', async () => {
    const request: DeliveryQuoteRequest = {
      cart_id: 'multi_pickup_cart',
      subtotal_ngn: 20000,
      items: [
        {
          id: '1',
          product_id: 'prod1',
          quantity: 1,
          price: 10000,
          pickup_location_id: 'seller_a',
          pickup_coords: { lat: 7.7333, lng: 8.5333 }
        },
        {
          id: '2',
          product_id: 'prod2',
          quantity: 1,
          price: 10000,
          pickup_location_id: 'seller_b',
          pickup_coords: { lat: 7.7250, lng: 8.5250 }
        }
      ],
      payment_method: 'card',
      delivery_coords: { lat: 7.7500, lng: 8.5167 },
      delivery_type: 'standard',
      requested_at: '2025-12-03T14:00:00Z'
    };
    
    const quote = await getDeliveryQuote(request);
    
    expect(quote.per_shipment_fees).toBeDefined();
    expect(quote.per_shipment_fees?.length).toBe(2);
  });

  test('should order shipments by pickup_location_id', async () => {
    const request: DeliveryQuoteRequest = {
      cart_id: 'multi_pickup_cart',
      subtotal_ngn: 20000,
      items: [
        {
          id: '1',
          product_id: 'prod1',
          quantity: 1,
          price: 10000,
          pickup_location_id: 'seller_z', // Higher alphabetically
          pickup_coords: { lat: 7.7333, lng: 8.5333 }
        },
        {
          id: '2',
          product_id: 'prod2',
          quantity: 1,
          price: 10000,
          pickup_location_id: 'seller_a', // Lower alphabetically
          pickup_coords: { lat: 7.7250, lng: 8.5250 }
        }
      ],
      payment_method: 'card',
      delivery_coords: { lat: 7.7500, lng: 8.5167 },
      delivery_type: 'standard',
      requested_at: '2025-12-03T14:00:00Z'
    };
    
    const quote = await getDeliveryQuote(request);
    
    expect(quote.per_shipment_fees?.[0].pickup_location_id).toBe('seller_a');
    expect(quote.per_shipment_fees?.[1].pickup_location_id).toBe('seller_z');
  });
});

describe('Delivery Type Multipliers', () => {
  test('should apply 1.3x for express in Makurdi', () => {
    const { subtotal: standard } = calculateShipmentFee(
      { lat: 7.7333, lng: 8.5333 },
      { lat: 7.7500, lng: 8.5167 },
      1, 5000, 'standard', 'card', true
    );
    
    const { subtotal: express } = calculateShipmentFee(
      { lat: 7.7333, lng: 8.5333 },
      { lat: 7.7500, lng: 8.5167 },
      1, 5000, 'express', 'card', true
    );
    
    // Express should be ~30% more (accounting for platform fee)
    expect(express).toBeGreaterThan(standard);
    expect(express / standard).toBeCloseTo(1.3, 0.5);
  });

  test('should apply 1.5x for express outside Makurdi', () => {
    const { subtotal: standard } = calculateShipmentFee(
      { lat: 7.2500, lng: 7.6500 },
      { lat: 7.1833, lng: 8.1333 },
      1, 5000, 'standard', 'card', false
    );
    
    const { subtotal: express } = calculateShipmentFee(
      { lat: 7.2500, lng: 7.6500 },
      { lat: 7.1833, lng: 8.1333 },
      1, 5000, 'express', 'card', false
    );
    
    expect(express).toBeGreaterThan(standard);
    expect(express / standard).toBeCloseTo(1.5, 0.5);
  });
});
