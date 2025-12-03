# Delivery System Logic Contract v2.0

## Overview
This document defines the complete delivery fee computation logic for the marketplace, supporting:
- Makurdi local zones (8 zones)
- Benue statewide delivery (23 LGAs)
- General backend fallback
- Frontend fallback

## 1. Core Pricing Rules

### 1.1 Distance Calculation
```
Distance_km = Haversine(pickup_lat, pickup_lng, delivery_lat, delivery_lng)
             rounded to 3 decimal places

Billable_km = Distance_km - zone.free_distance_km
            = Distance_km (default, since free_distance_km = 0)
```

### 1.2 Weight Calculation
```
Per item:
  volumetric_weight_kg = (length_cm * width_cm * height_cm) / 5000

Total:
  total_gross_kg = SUM(item.weight_kg * item.quantity)
  total_volumetric_kg = SUM(volumetric_weight_kg * item.quantity)
  
Effective_weight_kg = ROUND(MAX(total_gross_kg, total_volumetric_kg), 3)
```

### 1.3 Zone Base Fees (Makurdi)

| Zone Code | Zone Name        | Base Fee (NGN) | Per-km Rate | Min Fee | Max Fee | Dispatch Time |
|-----------|------------------|----------------|-------------|---------|---------|---------------|
| MKD-MM    | Modern Market    | 300            | 45          | 300     | 2,000   | 20 min        |
| MKD-WK    | Wurukum          | 350            | 50          | 350     | 2,500   | 25 min        |
| MKD-WD    | Wadata           | 350            | 50          | 350     | 2,500   | 25 min        |
| MKD-HL    | High Level       | 350            | 50          | 350     | 2,500   | 30 min        |
| MKD-NB    | North Bank       | 400            | 50          | 400     | 3,000   | 30 min        |
| MKD-LG    | Logo/Kanshio     | 400            | 50          | 400     | 3,000   | 35 min        |
| MKD-IL    | Industrial Layout| 450            | 55          | 450     | 3,500   | 40 min        |
| MKD-UA    | UAM Area         | 500            | 60          | 500     | 4,000   | 45 min        |

### 1.4 Benue LGA Fallback Rates
```
Base_fee = MAX(500, distance_km * 50)
Per_km_rate = 50 NGN
Min_fee = 500 NGN
Max_fee = 10,000 NGN
```

## 2. Fee Components (Computed in Order)

### Phase A: Base Fee Selection
```
1. Match pickup zone (specific Makurdi zone or LGA)
2. If matched: base_fee = zone.base_fee_ngn
3. Else: base_fee = MAX(500, distance_km * 50)
```

### Phase B: Modifiers (Applied Sequentially)

#### 2.1 Distance Fee
```
distance_fee = billable_km * zone.per_km_rate_ngn
             = distance_km * per_km_rate (since free_distance_km = 0)
```

#### 2.2 Weight Fee
```
weight_fee = 0                           if effective_weight_kg <= 5
           = (effective_weight_kg - 5) * 100   otherwise
           
// Fractional kg allowed
```

#### 2.3 Cross-Zone Fee
```
cross_zone_fee = CROSS_ZONE_FEES[pickup_zone][delivery_zone]
               ?? CROSS_ZONE_FEES[delivery_zone][pickup_zone]
               ?? 150  // default
               
// Only applies when pickup_zone != delivery_zone
```

#### 2.4 Delivery Type Multiplier

**Makurdi Zones:**
| Type      | Multiplier |
|-----------|------------|
| STANDARD  | 1.0        |
| EXPRESS   | 1.3        |
| SAME_DAY  | 1.5        |
| SCHEDULED | 1.0        |

**General Backend (Outside Makurdi):**
| Type      | Multiplier |
|-----------|------------|
| STANDARD  | 1.0        |
| EXPRESS   | 1.5        |
| SAME_DAY  | 2.0        |
| SCHEDULED | 1.0        |

#### 2.5 Insurance Fee
```
insurance_fee = 0                        if package_value_ngn <= 50,000
              = package_value_ngn * 0.01 otherwise (1%)
```

#### 2.6 COD Surcharge (General Backend Only)
```
cod_fee = 0                              if payment_method != 'cod'
        = package_value_ngn * 0.02       otherwise (2%)
```

#### 2.7 Platform Fee
```
subtotal = (base_fee + distance_fee + weight_fee + cross_zone_fee) * delivery_type_multiplier
platform_fee = ROUND(subtotal * 0.15)  // 15%
```

### Phase C: Total Calculation
```
total_fee = subtotal + insurance_fee + platform_fee + cod_fee
total_fee = MAX(total_fee, zone.min_fee)
total_fee = MIN(total_fee, zone.max_fee) if zone.max_fee is set
total_fee = ROUND(total_fee)  // nearest Naira
```

## 3. Multi-Shipment (Per-Pickup) Rules

### 3.1 Item Grouping
```
1. Each item must have pickup_location_id (seller/store ID)
2. Group items by pickup_location_id
3. Each group = 1 shipment
```

### 3.2 Per-Shipment Fee Calculation
```
For each shipment:
  - pickup_coords = item.pickup_coords ?? seller.location_coords ?? hub.coords
  - delivery_coords = customer delivery address
  - distance = Haversine(pickup_coords, delivery_coords)
  - Apply all fee components per shipment
  - Return fee breakdown and applied_rules
```

### 3.3 Combined Summary
```
per_shipment_fees = [
  { pickup_id, distance_km, fee_breakdown, subtotal, applied_rules },
  ...
]

combined_fee = SUM(shipment.subtotal)
combined_eta = {
  min: MIN(all shipment eta_min),
  max: MAX(all shipment eta_max)
}
```

### 3.4 Ordering
```
shipments ordered by: pickup_location_id ASC
applied_rules ordered by: (priority DESC, rule_id ASC)
```

## 4. Rule Evaluation Priority

### 4.1 Match Order (First Match Wins for Base Fee)
```
1. Pickup-zone specific rules (MKD-* zones)
2. LGA-level rules (Benue LGAs)
3. Benue-wide fallback
4. General backend
5. Frontend fallback (API unavailable)
```

### 4.2 Rule Application
```
Phase A: Select base fee
  - Find first matching set_fee rule
  
Phase B: Apply modifiers
  - Sort all matching modifier rules by (priority DESC, id ASC)
  - Apply in order: add_fee, percent_of_subtotal, insurance, COD, multipliers
  - Apply min/max caps last
  
Special rules:
  - free_shipping: Sets total to 0 (unless block_delivery also matches)
  - block_delivery: Takes precedence, returns is_available=false
```

## 5. ETA Model

### 5.1 Travel Profile
| Profile     | Per-km Minutes |
|-------------|----------------|
| urban       | 2.5            |
| inner_city  | 3.0            |
| suburban    | 3.5            |
| rural       | 5.0            |

### 5.2 Traffic Multiplier
```
Peak hours: 07:00-09:00, 16:00-19:00
  multiplier = 1.0 + zone.congestion_factor (default 0.3)
  
Off-peak:
  multiplier = 1.0
```

### 5.3 Rider Availability Delay
```
if active_riders >= queued_jobs:
  rider_delay = 5 minutes
else:
  rider_delay = 5 + (queued_jobs - active_riders) * 4 minutes
```

### 5.4 ETA Calculation
```
travel_minutes = per_km_minutes * distance_km * traffic_multiplier
raw_eta = base_zone_dispatch_minutes 
        + pickup_handling_delay (default 3-10 min per merchant)
        + rider_availability_delay
        + travel_minutes

buffer = raw_eta * operational_buffer_percent (default 0.15)
eta_min = FLOOR(raw_eta)
eta_max = CEIL(raw_eta + buffer)
```

### 5.5 Delivery Type Adjustments
| Type      | Travel Multiplier | Rider Penalty |
|-----------|-------------------|---------------|
| STANDARD  | 1.0               | +0 min        |
| EXPRESS   | 0.85              | +3 min        |
| SAME_DAY  | 0.80              | +5 min        |
| SCHEDULED | 1.0               | +0 min        |

### 5.6 Friendly Format
```
if eta_max <= 120:
  friendly = "{eta_min}-{eta_max} mins"
else:
  hours_min = FLOOR(eta_min / 60)
  hours_max = CEIL(eta_max / 60)
  friendly = "{hours_min}-{hours_max} hours"
```

## 6. Admin Controls

### 6.1 Zone Management
- Create/edit/suspend/resume zones
- Set free_distance_km per zone (default 0)
- Configure cross-zone fees
- Set travel profiles per zone
- Toggle delivery types per zone

### 6.2 Operational Controls
- Set active_riders and queued_jobs per zone
- Configure congestion factors
- Set operational buffers
- Import zones via GeoJSON/CSV

### 6.3 Rule Management
- Create custom pricing rules
- Set rule priorities
- Configure free_shipping conditions
- Set block_delivery areas
- Preview rules with dry-run carts

## 7. API Response Format

### POST /delivery-quote
```json
{
  "cart_id": "string",
  "currency": "NGN",
  "effective_weight_kg": 2.5,
  "distance_km": 4.235,
  "delivery_options": [
    {
      "id": "standard",
      "label": "Standard Delivery",
      "price_ngn": 850,
      "price_breakdown": [
        { "name": "Base Fee", "amount": 350 },
        { "name": "Distance Fee (4.24km)", "amount": 212 },
        { "name": "Platform Fee (15%)", "amount": 84 },
        { "name": "Insurance", "amount": 0 }
      ],
      "estimated_eta_minutes": { "min": 35, "max": 48 },
      "eta_friendly": "35-48 mins",
      "applied_rules": ["rule_mkd_wk_base", "rule_distance_standard"],
      "tags": ["recommended"],
      "is_available": true
    }
  ],
  "per_shipment_fees": [
    {
      "pickup_location_id": "seller_123",
      "pickup_zone": "MKD-WK",
      "delivery_zone": "MKD-NB",
      "distance_km": 4.235,
      "fee_breakdown": [...],
      "subtotal_ngn": 850,
      "applied_rules": [...]
    }
  ],
  "grand_total_ngn": 850
}
```

## 8. Frontend Fallback

When API is unavailable or location outside coverage:
```
shipping_fee = 0       if subtotal_ngn > 50,000
             = 2,500   otherwise

tax = subtotal_ngn * 0.075  (7.5% VAT, display only)
```

## 9. Agent Earnings

```
agent_earning = subtotal * 0.85  (85%)
platform_take = subtotal * 0.15  (15%)
```

## 10. Suspended Areas

When a zone is suspended:
```json
{
  "is_available": false,
  "suspension_reason": "Admin reason here",
  "suspended_at": "ISO timestamp",
  "resume_eta": "ISO timestamp or null"
}
```

## 11. Change Log

### v2.0 Changes from v1.0
1. **free_distance_km default changed**: Was implicit 3km free, now 0 (bill from km 0)
2. **Volumetric weight added**: Now considers dimensional weight
3. **Per-pickup shipments**: Multi-seller carts split into separate shipments
4. **Statewide coverage**: All 23 Benue LGAs now supported
5. **Deterministic rule ordering**: Rules sorted by (priority DESC, id ASC)
6. **ETA model enhanced**: Traffic, rider availability, operational buffer
7. **Admin controls expanded**: Zone CRUD, rule preview, import/export
8. **Historical quote flagging**: Old quotes marked with computed_under_old_free_distance=true
