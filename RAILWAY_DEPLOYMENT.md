# Railway Deployment Guide - Diwan Al-Maarifa Backend

## Quick Deployment to Railway

Railway is a modern hosting platform that makes deployment incredibly easy. It offers a generous free tier perfect for getting started.

### Why Railway?

✅ **Free Tier**: $5 credit/month (enough for small projects)  
✅ **Easy Setup**: Deploy in 5 minutes  
✅ **Auto Deploy**: Automatic deployments from GitHub  
✅ **Built-in Database**: PostgreSQL available (but we're using Supabase)  
✅ **Custom Domains**: Free SSL certificates  
✅ **Great DX**: Excellent developer experience  

---

## Step-by-Step Deployment

### Step 1: Create Railway Account

1. **Go to**: https://railway.app
2. **Click**: "Start a New Project" or "Login"
3. **Sign in with GitHub** (recommended for automatic deployments)
4. **Authorize Railway** to access your GitHub repositories

### Step 2: Create New Project

1. **Click**: "New Project"
2. **Select**: "Deploy from GitHub repo"
3. **Choose**: `Diwan-Al-Maarifa` repository
4. **Select**: The repository from the list

### Step 3: Configure Root Directory

Since our backend is in a subdirectory:

1. **Click**: "Settings" (gear icon)
2. **Find**: "Root Directory"
3. **Set to**: `backend`
4. **Save**

### Step 4: Add Environment Variables

Click on "Variables" tab and add these environment variables:

```env
NODE_ENV=production
PORT=3000

# Database (Supabase)
DB_HOST=db.zfqljfvxmvbnhbrqlwju.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=!Inf105090

DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# JWT
JWT_SECRET=rHgp9KayaFYw0S/hh+Kf4lYIWzP9kqw3K3dIdbXSoDQ=
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Frontend
FRONTEND_URL=https://alhuwaidias-arch.github.io/Diwan-Al-Maarifa

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=10
SESSION_SECRET=rHgp9KayaFYw0S/hh+Kf4lYIWzP9kqw3K3dIdbXSoDQ=

# Features
ENABLE_REGISTRATION=true
ENABLE_COMMENTS=false
ENABLE_ANALYTICS=true
ENABLE_EMAIL_NOTIFICATIONS=false
```

**How to Add Variables**:
1. Click "New Variable"
2. Enter variable name (e.g., `NODE_ENV`)
3. Enter value (e.g., `production`)
4. Click "Add"
5. Repeat for all variables

**Pro Tip**: You can also use "Raw Editor" to paste all variables at once in KEY=VALUE format.

### Step 5: Deploy

1. **Click**: "Deploy"
2. **Wait**: 2-3 minutes for build and deployment
3. **Check logs**: Monitor deployment progress in the "Deployments" tab

### Step 6: Get Your API URL

Once deployed:

1. **Go to**: "Settings" tab
2. **Find**: "Domains" section
3. **Copy**: Your Railway domain (e.g., `diwan-maarifa-production.up.railway.app`)

Your API will be available at:
```
https://your-project.up.railway.app
```

---

## Testing Your Deployed API

### Health Check

```bash
curl https://your-project.up.railway.app/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T...",
  "database": "connected"
}
```

### API Root

```bash
curl https://your-project.up.railway.app/
```

**Expected Response**:
```json
{
  "message": "ديوان المعرفة API",
  "version": "1.0.0",
  "status": "running"
}
```

### Register a User

```bash
curl -X POST https://your-project.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "full_name": "Test User",
    "role": "contributor"
  }'
```

### Login

```bash
curl -X POST https://your-project.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

---

## Monitoring Your Deployment

### Railway Dashboard

**View**:
- **Deployments**: Build and deployment history
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Settings**: Configuration and environment variables

**Access Logs**:
1. Go to your project
2. Click on "Deployments"
3. Click on the active deployment
4. View logs in real-time

### Check Database Connection

In Railway logs, you should see:
```
Database connected at: 2025-12-11T...
✓ Server running on port 3000
```

---

## Custom Domain (Optional)

### Add Your Own Domain

1. **Go to**: "Settings" → "Domains"
2. **Click**: "Add Domain"
3. **Enter**: Your domain (e.g., `api.diwan-maarifa.com`)
4. **Add DNS Records**: Follow Railway's instructions
5. **Wait**: DNS propagation (5-30 minutes)
6. **SSL**: Automatically provisioned

**DNS Records to Add**:
```
Type: CNAME
Name: api (or your subdomain)
Value: your-project.up.railway.app
```

---

## Automatic Deployments

Railway automatically deploys when you push to GitHub!

**How it Works**:
1. You push code to GitHub
2. Railway detects the change
3. Automatically builds and deploys
4. Takes 2-3 minutes

**Manual Deploy**:
- Click "Deploy" button in Railway dashboard
- Select specific commit or branch

---

## Environment Management

### Update Environment Variables

1. **Go to**: "Variables" tab
2. **Edit**: Click on variable to modify
3. **Save**: Changes trigger automatic redeploy

### Multiple Environments

Create separate Railway projects for:
- **Development**: `diwan-dev`
- **Staging**: `diwan-staging`
- **Production**: `diwan-production`

---

## Troubleshooting

### Build Fails

**Check**:
- Root directory is set to `backend`
- `package.json` exists in backend folder
- All dependencies are listed

**Solution**:
- View build logs for specific error
- Ensure Node.js version is compatible

### Deployment Succeeds but App Crashes

**Check**:
- Environment variables are set correctly
- Database connection is working
- Port is set to `3000` or `$PORT`

**Solution**:
- View runtime logs
- Check database credentials
- Verify Supabase is accessible

### Database Connection Fails

**Check**:
- DB_HOST is correct
- DB_PASSWORD is correct
- SSL is enabled (NODE_ENV=production)

**Solution**:
- Test connection from Railway logs
- Verify Supabase allows connections from Railway IPs

### 502 Bad Gateway

**Possible Causes**:
- App crashed on startup
- Port binding issue
- Health check failing

**Solution**:
- Check logs for errors
- Ensure app listens on `process.env.PORT || 3000`
- Verify health endpoint works

---

## Cost Management

### Free Tier Limits

Railway provides:
- **$5 credit/month** (free)
- **500 hours** of execution time
- **100 GB** bandwidth
- **1 GB** memory per service

### Monitoring Usage

1. **Go to**: Account Settings
2. **View**: Usage & Billing
3. **Monitor**: Current month's usage

### Staying Within Free Tier

✅ **Use Supabase** for database (not Railway's PostgreSQL)  
✅ **Optimize queries** to reduce CPU usage  
✅ **Enable caching** where possible  
✅ **Monitor logs** for errors that cause restarts  

**Typical Usage**:
- Small API: ~$2-3/month
- Medium traffic: ~$5-8/month
- High traffic: $10+/month

---

## Scaling Up

### When to Upgrade

Consider paid plan when:
- Exceeding free tier credits
- Need more than 1 GB RAM
- Want priority support
- Need team collaboration

### Railway Pro

**Cost**: $20/month  
**Includes**:
- $20 usage credit
- Priority support
- Team features
- Higher limits

---

## Security Best Practices

### Environment Variables

✅ **Never commit** `.env` files  
✅ **Use Railway variables** for secrets  
✅ **Rotate secrets** regularly  
✅ **Use different credentials** for each environment  

### Database Security

✅ **Use SSL** for database connections (enabled)  
✅ **Strong passwords** for database  
✅ **Limit CORS origins** in production  
✅ **Enable rate limiting** (configured)  

### API Security

✅ **HTTPS only** (Railway provides SSL)  
✅ **JWT authentication** (implemented)  
✅ **Input validation** (implemented)  
✅ **Helmet security headers** (configured)  

---

## Backup Strategy

### Database Backups

Your Supabase database has:
- ✅ Automatic daily backups (7 days retention)
- ✅ Point-in-time recovery
- ✅ Manual backup option

### Code Backups

Your code is backed up in:
- ✅ GitHub repository
- ✅ Railway deployment history
- ✅ Local development machine

---

## Next Steps After Deployment

Once your backend is deployed:

1. ✅ **Test all endpoints** with the deployed URL
2. ✅ **Update frontend** to use the new API URL
3. ✅ **Configure custom domain** (optional)
4. ✅ **Set up monitoring** and alerts
5. ✅ **Enable email notifications** when ready
6. ✅ **Build and deploy frontend**
7. ✅ **Deploy AI agent** for content review

---

## Support

**Railway**:
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

**Diwan Al-Maarifa**:
- Repository: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa
- Issues: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa/issues

---

## Quick Reference

### Railway URLs

**Dashboard**: https://railway.app/dashboard  
**Docs**: https://docs.railway.app  
**Pricing**: https://railway.app/pricing  

### Your Project

**Repository**: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa  
**Database**: Supabase (db.zfqljfvxmvbnhbrqlwju.supabase.co)  
**API URL**: (will be assigned after deployment)  

### Important Commands

```bash
# Test health endpoint
curl https://your-api.railway.app/health

# Test registration
curl -X POST https://your-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test","role":"contributor"}'

# View logs (from Railway CLI)
railway logs

# Deploy manually (from Railway CLI)
railway up
```

---

**Deployment Time**: ~5-10 minutes  
**Difficulty**: Easy  
**Cost**: Free (with $5/month credit)  
**Status**: Production-Ready ✅
