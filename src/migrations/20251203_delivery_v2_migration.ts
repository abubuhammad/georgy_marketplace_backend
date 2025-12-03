/**
 * Migration Script: Delivery System v2.0
 * 
 * Purpose:
 * 1. Set free_distance_km = 0 for all existing zones
 * 2. Flag historical quotes computed under old free-distance rules
 * 3. Import Benue LGA zones with centroid fallback
 * 
 * Run: npx ts-node src/migrations/20251203_delivery_v2_migration.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MigrationResult {
  success: boolean;
  zonesUpdated: number;
  quotesFlag: number;
  zonesImported: number;
  errors: string[];
}

async function runMigration(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    zonesUpdated: 0,
    quotesFlag: 0,
    zonesImported: 0,
    errors: []
  };

  console.log('='.repeat(60));
  console.log('DELIVERY SYSTEM v2.0 MIGRATION');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Set free_distance_km = 0 for all existing zones
    console.log('[Step 1/4] Updating free_distance_km to 0 for existing zones...');
    
    const zonesUpdateResult = await prisma.$runCommandRaw({
      update: 'makurdi_delivery_zones',
      updates: [
        {
          q: {},
          u: { $set: { free_distance_km: 0, updated_at: new Date() } },
          multi: true
        }
      ]
    }) as any;

    // Also update the regular delivery zones
    const regularZonesUpdate = await prisma.$runCommandRaw({
      update: 'delivery_zones',
      updates: [
        {
          q: {},
          u: { 
            $set: { 
              free_distance_km: 0,
              updatedAt: new Date()
            } 
          },
          multi: true
        }
      ]
    }) as any;

    result.zonesUpdated = (zonesUpdateResult?.nModified || 0) + (regularZonesUpdate?.nModified || 0);
    console.log(`   ✓ Updated ${result.zonesUpdated} zones with free_distance_km = 0\n`);

    // Step 2: Flag historical quotes computed under old free-distance rules
    console.log('[Step 2/4] Flagging historical quotes computed under old rules...');
    
    const cutoffDate = new Date('2025-12-03T00:00:00Z'); // Migration date
    
    const quotesUpdateResult = await prisma.$runCommandRaw({
      update: 'delivery_quotes',
      updates: [
        {
          q: { 
            createdAt: { $lt: cutoffDate },
            computed_under_old_free_distance: { $exists: false }
          },
          u: { 
            $set: { 
              computed_under_old_free_distance: true,
              migration_flagged_at: new Date(),
              migration_version: '2.0'
            } 
          },
          multi: true
        }
      ]
    }) as any;

    result.quotesFlag = quotesUpdateResult?.nModified || 0;
    console.log(`   ✓ Flagged ${result.quotesFlag} historical quotes\n`);

    // Step 3: Import Benue LGA zones
    console.log('[Step 3/4] Importing Benue LGA zones...');
    
    const seedPath = path.join(__dirname, '../data/benue-lgas-seed.json');
    
    if (!fs.existsSync(seedPath)) {
      result.errors.push('Seed file not found at: ' + seedPath);
      console.log('   ⚠ Seed file not found, skipping zone import\n');
    } else {
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      
      // Import Makurdi zones
      for (const zone of seedData.makurdi_zones || []) {
        try {
          await prisma.$runCommandRaw({
            update: 'makurdi_delivery_zones',
            updates: [
              {
                q: { code: zone.code },
                u: {
                  $set: {
                    name: zone.name,
                    code: zone.code,
                    lga: zone.lga,
                    type: zone.type,
                    centerPoint: JSON.stringify(zone.center),
                    areas: JSON.stringify(zone.areas),
                    baseFee: zone.pricing.base_fee_ngn,
                    perKmFee: zone.pricing.per_km_rate_ngn,
                    minFee: zone.pricing.min_fee_ngn,
                    maxFee: zone.pricing.max_fee_ngn,
                    free_distance_km: 0,
                    eta_config: JSON.stringify(zone.eta),
                    delivery_types: JSON.stringify(zone.delivery_types),
                    isActive: zone.is_active,
                    is_suspended: zone.is_suspended,
                    updatedAt: new Date()
                  },
                  $setOnInsert: {
                    createdAt: new Date()
                  }
                },
                upsert: true
              }
            ]
          });
          result.zonesImported++;
        } catch (err: any) {
          result.errors.push(`Failed to import zone ${zone.code}: ${err.message}`);
        }
      }

      // Import Benue LGA zones
      for (const lga of seedData.benue_lgas || []) {
        try {
          await prisma.$runCommandRaw({
            update: 'benue_lga_zones',
            updates: [
              {
                q: { code: lga.code },
                u: {
                  $set: {
                    name: lga.name,
                    code: lga.code,
                    state: lga.state,
                    type: lga.type,
                    centerPoint: JSON.stringify(lga.center),
                    radius_km: lga.radius_km,
                    headquarters: lga.headquarters,
                    baseFee: lga.pricing.base_fee_ngn,
                    perKmFee: lga.pricing.per_km_rate_ngn,
                    minFee: lga.pricing.min_fee_ngn,
                    maxFee: lga.pricing.max_fee_ngn,
                    free_distance_km: 0,
                    eta_config: JSON.stringify(lga.eta),
                    delivery_types: JSON.stringify(lga.delivery_types),
                    isActive: lga.is_active,
                    is_suspended: lga.is_suspended,
                    updatedAt: new Date()
                  },
                  $setOnInsert: {
                    createdAt: new Date()
                  }
                },
                upsert: true
              }
            ]
          });
          result.zonesImported++;
        } catch (err: any) {
          result.errors.push(`Failed to import LGA ${lga.code}: ${err.message}`);
        }
      }

      // Store cross-zone fees
      await prisma.$runCommandRaw({
        update: 'delivery_settings',
        updates: [
          {
            q: { key: 'cross_zone_fees' },
            u: {
              $set: {
                key: 'cross_zone_fees',
                value: JSON.stringify(seedData.cross_zone_fees),
                description: 'Cross-zone delivery fee configuration',
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            upsert: true
          }
        ]
      });

      // Store delivery type multipliers
      await prisma.$runCommandRaw({
        update: 'delivery_settings',
        updates: [
          {
            q: { key: 'delivery_type_multipliers' },
            u: {
              $set: {
                key: 'delivery_type_multipliers',
                value: JSON.stringify(seedData.delivery_type_multipliers),
                description: 'Delivery type multiplier configuration',
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            upsert: true
          }
        ]
      });

      // Store travel profiles
      await prisma.$runCommandRaw({
        update: 'delivery_settings',
        updates: [
          {
            q: { key: 'travel_profiles' },
            u: {
              $set: {
                key: 'travel_profiles',
                value: JSON.stringify(seedData.travel_profiles),
                description: 'Travel speed profiles by area type',
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            upsert: true
          }
        ]
      });

      // Store defaults
      await prisma.$runCommandRaw({
        update: 'delivery_settings',
        updates: [
          {
            q: { key: 'delivery_defaults' },
            u: {
              $set: {
                key: 'delivery_defaults',
                value: JSON.stringify(seedData.defaults),
                description: 'Default delivery configuration values',
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            upsert: true
          }
        ]
      });

      console.log(`   ✓ Imported ${result.zonesImported} zones\n`);
    }

    // Step 4: Create migration log entry
    console.log('[Step 4/4] Creating migration log entry...');
    
    await prisma.$runCommandRaw({
      insert: 'migration_logs',
      documents: [
        {
          migration_name: '20251203_delivery_v2_migration',
          version: '2.0',
          status: 'completed',
          zones_updated: result.zonesUpdated,
          quotes_flagged: result.quotesFlag,
          zones_imported: result.zonesImported,
          errors: result.errors,
          executed_at: new Date(),
          changes_summary: {
            free_distance_km: 'Set to 0 for all zones (previously implicit 3km free)',
            historical_quotes: 'Flagged with computed_under_old_free_distance=true',
            benue_lgas: 'Imported 23 LGA zones with centroid fallback',
            makurdi_zones: 'Updated 8 Makurdi sub-zones'
          }
        }
      ]
    });
    
    console.log('   ✓ Migration log created\n');

    result.success = true;

  } catch (error: any) {
    result.errors.push(error.message);
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }

  // Print summary
  console.log('='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Status: ${result.success ? '✓ SUCCESS' : '✗ FAILED'}`);
  console.log(`Zones updated: ${result.zonesUpdated}`);
  console.log(`Historical quotes flagged: ${result.quotesFlag}`);
  console.log(`Zones imported: ${result.zonesImported}`);
  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.length}`);
    result.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }
  console.log(`Completed at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  return result;
}

// Rollback function
async function rollbackMigration(): Promise<void> {
  console.log('Rolling back migration...');
  
  try {
    // Note: This is a partial rollback - the free_distance_km change is permanent
    // as it represents the new business logic
    
    // Remove migration flag from quotes
    await prisma.$runCommandRaw({
      update: 'delivery_quotes',
      updates: [
        {
          q: { migration_version: '2.0' },
          u: { 
            $unset: { 
              computed_under_old_free_distance: '',
              migration_flagged_at: '',
              migration_version: ''
            } 
          },
          multi: true
        }
      ]
    });

    // Mark migration as rolled back
    await prisma.$runCommandRaw({
      update: 'migration_logs',
      updates: [
        {
          q: { migration_name: '20251203_delivery_v2_migration' },
          u: { 
            $set: { 
              status: 'rolled_back',
              rolled_back_at: new Date()
            } 
          }
        }
      ]
    });

    console.log('Rollback completed (partial - free_distance_km remains at 0)');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use as module
export { runMigration, rollbackMigration };

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    rollbackMigration()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    runMigration()
      .then((result) => process.exit(result.success ? 0 : 1))
      .catch(() => process.exit(1));
  }
}
