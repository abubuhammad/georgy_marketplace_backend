# Render Deployment Setup Guide

## Prerequisites

1. Your backend is pushed to GitHub (separate repository or branch)
2. You have a Render account (https://render.com)
3. You have a PostgreSQL database connection string (Supabase or similar)

## Step 1: Create a Render Web Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your repository**:
   - Select "GitHub" and authorize if needed
   - Choose the backend repository
   - Select the branch (usually `main` or `master`)

4. **Configure the Service**:
   - **Name**: `georgy-marketplace-backend`
   - **Runtime**: `Node`
   - **Region**: `Ohio` (or closest to your users)
   - **Plan**: `Free` (or `Starter` for production)
   - **Build Command**: `npm ci && npm run build && npx prisma generate`
   - **Start Command**: `npm start`

## Step 2: Set Environment Variables

1. **In the Web Service Settings**, go to **Environment**
2. **Add the following variables**:

### Required Variables:

```
DATABASE_URL = postgresql://user:password@host:port/database
JWT_SECRET = your-super-secret-jwt-key-here
NODE_ENV = production
PORT = 10000
FRONTEND_URL = https://your-vercel-frontend-url.vercel.app
```

### Optional Variables (Based on Your Services):

```
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret

EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-email-password

JWT_EXPIRES_IN = 7d
JWT_REFRESH_EXPIRES_IN = 30d
BCRYPT_SALT_ROUNDS = 12
```

## Step 3: Database Configuration

### For Supabase PostgreSQL:

1. Go to your Supabase project
2. **Settings** → **Database** → **Connection Pooling**
3. Copy the connection string (change password if needed)
4. Use URL-encoded password if it contains special characters:
   - `@` becomes `%40`
   - `:` becomes `%3A`
   - `#` becomes `%23`
   - etc.

Example:
```
postgresql://postgres:Fareeda%401984@db.zrxtlbhdpgtdjetuuebt.supabase.co:5432/postgres
```

### For Other PostgreSQL Providers:

Ensure you have:
- Host/Server address
- Port (usually 5432)
- Username
- Password (URL-encoded)
- Database name

## Step 4: Deploy

1. After setting all environment variables, click **"Deploy"**
2. Watch the **Logs** tab for build and deployment status
3. Once complete, you'll get a service URL like: `https://georgy-marketplace-backend.onrender.com`

## Step 5: Verify Deployment

### Test API Health:
```bash
curl https://georgy-marketplace-backend.onrender.com/api/health
```

### Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-28T10:30:00Z"
}
```

### Test Database Connection:
```bash
curl https://georgy-marketplace-backend.onrender.com/api/test-db
```

## Troubleshooting Common Render Deployment Issues

### Issue 1: Build Fails - "npm: command not found"
**Solution**: Ensure your `package.json` exists in the backend directory and all dependencies are listed.

### Issue 2: Database Connection Fails
**Solution**:
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure IP whitelist allows Render servers (typically add `0.0.0.0/0`)
- Test locally first: `npm run dev`

### Issue 3: Port 10000 Already in Use
**Solution**: Render uses port 10000. Make sure your server listens on `process.env.PORT || 10000`

### Issue 4: Prisma Generate Fails
**Solution**:
- Ensure `prisma` is in `devDependencies` in `package.json`
- Run locally: `npx prisma generate`
- Check schema.prisma is valid

### Issue 5: Service Goes to Sleep (Free Plan)
**Solution**: Render's free tier spins down after 15 minutes of inactivity. 
- Upgrade to Starter plan for production
- Or keep your frontend pinging the health endpoint

### Issue 6: CORS Errors
**Solution**: Update your backend server.ts CORS configuration:
```typescript
cors({
  origin: [
    'https://your-vercel-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
})
```

## Step 6: Update Frontend API URL

In your frontend code (Vercel), update API calls to use the Render backend:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://georgy-marketplace-backend.onrender.com';
```

Add to your Vercel Environment Variables:
```
REACT_APP_API_URL = https://georgy-marketplace-backend.onrender.com
VITE_API_URL = https://georgy-marketplace-backend.onrender.com
```

## Monitoring and Logs

1. **View Logs**: In Render Dashboard → Your Service → **Logs** tab
2. **Monitor Metrics**: See CPU, Memory, Network usage
3. **Set Up Alerts**: Available on paid plans

## Auto-Deploy from GitHub

Once connected:
- Push to your configured branch (usually `main`)
- Render automatically builds and deploys
- View deployment status in the **Deployments** tab

## Useful Commands

```bash
# Test your backend locally before pushing
npm run dev

# Generate Prisma client
npx prisma generate

# Build for production
npm run build

# Start production server
npm start
```

## Production Checklist

- [ ] Environment variables set in Render
- [ ] Database connection verified
- [ ] CORS origins updated for Vercel frontend
- [ ] Health check endpoint working
- [ ] API endpoints responding
- [ ] Prisma migrations applied
- [ ] Error handling working
- [ ] Logs monitoring enabled
- [ ] Frontend pointing to Render backend URL
- [ ] Testing with real data

## Support

- **Render Documentation**: https://render.com/docs
- **Prisma Documentation**: https://www.prisma.io/docs/
- **PostgreSQL Connection Issues**: https://www.postgresql.org/docs/
