# Vercel Environment Variables Setup

## Critical: Set Environment Variables in Vercel Dashboard

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Select your project**: `georgy-marketplace-backend`
3. **Go to Settings → Environment Variables**
4. **Add these variables:**

### Required Variables:
```
DATABASE_URL = postgresql://postgres:Fareeda%401984@db.zrxtlbhdpgtdjetuuebt.supabase.co:5432/postgres
JWT_SECRET = 7d9f1e2c8a4b5f0e3d6c9a1b2f8e4d7c3b6a5f0e1c9d2b3f8a4c7e6d1b0a9f2
NODE_ENV = production
FRONTEND_URL = https://your-frontend-domain.com
```

### Optional Variables:
```
JWT_EXPIRES_IN = 7d
JWT_REFRESH_EXPIRES_IN = 30d
BCRYPT_SALT_ROUNDS = 12
```

## Important Notes:

1. **DATABASE_URL**: Use the URL-encoded version with `%40` instead of `@` in the password
2. **Environment**: Set for "Production", "Preview", and "Development"
3. **Redeploy**: After adding variables, trigger a redeploy

## Test Database Connection

After setting up the environment variables and redeploying:

1. **Test endpoint**: https://georgy-marketplace-backend.vercel.app/api/test-db
2. **Expected response**: JSON with database connection details
3. **If successful**: You'll see current time, database version, and table list

## Troubleshooting

If the test fails:
- Check Vercel function logs
- Verify DATABASE_URL is exactly correct
- Ensure Supabase project is active
- Check network connectivity from Vercel to Supabase