#!/usr/bin/env node
/*
  copyMongoToAtlas.js
  Copies all collections and documents (and basic indexes) from a source MongoDB
  to a target MongoDB (Atlas). Uses env vars:
    - SOURCE_MONGO_URI (falls back to DATABASE_URL)
    - TARGET_MONGO_URI (falls back to MONGODB_URI or ATLAS_URI)

  Usage (PowerShell):
    $env:SOURCE_MONGO_URI = "mongodb://.../sourceDb"; $env:TARGET_MONGO_URI = "mongodb+srv://.../targetDb"; node backend\prisma\copyMongoToAtlas.js

*/
const { MongoClient } = require('mongodb');
require('dotenv').config();

const sourceUri = process.env.SOURCE_MONGO_URI || process.env.DATABASE_URL;
const targetUri = process.env.TARGET_MONGO_URI || process.env.MONGODB_URI || process.env.ATLAS_URI;

if (!sourceUri) {
  console.error('ERROR: SOURCE_MONGO_URI or DATABASE_URL must be set in environment');
  process.exit(1);
}
if (!targetUri) {
  console.error('ERROR: TARGET_MONGO_URI or MONGODB_URI must be set in environment');
  process.exit(1);
}

function parseDbName(uri) {
  try {
    // crude parsing: DB name is the path after the last '/'
    const afterSlash = uri.split('/').pop();
    if (!afterSlash) return null;
    // remove query params
    const db = afterSlash.split('?')[0];
    // if it's empty (e.g., uri ends with /) return null
    return db || null;
  } catch (e) {
    return null;
  }
}

(async () => {
  const sourceClient = new MongoClient(sourceUri, { maxPoolSize: 10 });
  const targetClient = new MongoClient(targetUri, { maxPoolSize: 10 });

  try {
    console.log('Connecting to source...');
    await sourceClient.connect();
    console.log('Connecting to target Atlas...');
    await targetClient.connect();

    const sourceDbName = parseDbName(sourceUri) || undefined;
    const targetDbName = parseDbName(targetUri) || undefined;

    const sourceDb = sourceClient.db(sourceDbName);
    const targetDb = targetClient.db(targetDbName);

    console.log(`Source DB: ${sourceDb.databaseName}`);
    console.log(`Target DB: ${targetDb.databaseName}`);

    const collections = await sourceDb.listCollections().toArray();
    if (!collections.length) {
      console.log('No collections found in source DB. Nothing to copy.');
      return;
    }

    for (const collInfo of collections) {
      const name = collInfo.name;
      console.log(`\n--- Processing collection: ${name}`);

      const sourceColl = sourceDb.collection(name);
      const targetColl = targetDb.collection(name);

      // Fetch documents in batches to avoid OOM for very large collections
      const docs = await sourceColl.find({}).toArray();
      console.log(`  Found ${docs.length} documents`);

      // Optionally clear target collection first
      if (docs.length > 0) {
        console.log('  Clearing target collection (deleteMany)');
        await targetColl.deleteMany({});
        // Insert documents (preserve _id)
        console.log('  Inserting documents into target');
        // If there are too many documents, insert in chunks
        const chunkSize = 1000;
        for (let i = 0; i < docs.length; i += chunkSize) {
          const chunk = docs.slice(i, i + chunkSize);
          await targetColl.insertMany(chunk, { ordered: false });
          console.log(`    Inserted ${Math.min(i + chunkSize, docs.length)} / ${docs.length}`);
        }
      } else {
        console.log('  No documents to copy');
      }

      // Copy indexes (basic): skip the _id index
      try {
        const indexes = await sourceColl.indexes();
        for (const idx of indexes) {
          if (idx.name === '_id_') continue;
          const options = {};
          if (idx.unique) options.unique = true;
          if (idx.sparse) options.sparse = true;
          if (typeof idx.expireAfterSeconds !== 'undefined') options.expireAfterSeconds = idx.expireAfterSeconds;
          if (idx.name) options.name = idx.name;
          try {
            console.log(`  Creating index ${idx.name} on target (keys: ${JSON.stringify(idx.key)})`);
            await targetColl.createIndex(idx.key, options);
          } catch (e) {
            console.warn(`    Could not create index ${idx.name}: ${e.message}`);
          }
        }
      } catch (e) {
        console.warn('  Could not copy indexes:', e.message);
      }

      console.log(`  Done with collection: ${name}`);
    }

    console.log('\nAll collections processed.');
  } catch (err) {
    console.error('Fatal error during copy:', err);
    process.exitCode = 2;
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
})();
