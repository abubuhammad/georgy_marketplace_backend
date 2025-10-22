# Database Setup Guide for Georgy Marketplace

Since you can't connect to Supabase directly from your local environment, here are your options to get your database set up:

## Option 1: Manual Setup via Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Navigate to: https://app.supabase.com/project/zrxtlbhdpgtdjetuuebt
   - Click on "SQL Editor" in the left sidebar

2. **Run the SQL migration script**
   - Copy the entire content from `supabase-complete-migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should see all your tables: users, products, orders, etc.

## Option 2: Use your deployed backend API

Your deployed backend should be able to connect to Supabase. Let me check your deployment URL first.

## Option 3: Check Connection Settings

Your current DATABASE_URL is:
```
postgresql://postgres:Fareeda@1984@db.zrxtlbhdpgtdjetuuebt.supabase.co:5432/postgres
```

**Possible issues:**
1. **Password encoding**: The `@` symbol in your password might need escaping
2. **Network restrictions**: Your local network might block Supabase connections
3. **Supabase project status**: Check if your project is active in the dashboard

**Alternative DATABASE_URL formats to try:**
```bash
# Option 1: URL encode the entire password
DATABASE_URL="postgresql://postgres:Fareeda%401984@db.zrxtlbhdpgtdjetuuebt.supabase.co:5432/postgres"

# Option 2: Escape with backslash (in some cases)
DATABASE_URL="postgresql://postgres:Fareeda\\@1984@db.zrxtlbhdpgtdjetuuebt.supabase.co:5432/postgres"

# Option 3: Use connection pooling
DATABASE_URL="postgresql://postgres:Fareeda@1984@db.zrxtlbhdpgtdjetuuebt.supabase.co:6543/postgres?pgbouncer=true"
```

## Option 4: Test Connection

Try connecting with a simple Node.js test:

```javascript
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => {
    console.log('Connected to Supabase!');
    return client.query('SELECT NOW()');
  })
  .then(result => {
    console.log('Current time:', result.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });
```

## What to do next:

1. **Start with Option 1** - Manual SQL execution in Supabase dashboard
2. Once tables are created, test your backend API endpoints
3. Your Prisma client is already generated and ready to use

## Verifying Success

After running the migration, you should see these core tables in Supabase:
- users
- sellers  
- products
- orders
- reviews
- payments
- notifications
- and many more...

Each table will have the proper indexes and relationships set up for optimal performance.