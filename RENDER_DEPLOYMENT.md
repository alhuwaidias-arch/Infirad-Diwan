# Render Deployment Guide - Diwan Al-Maarifa Backend

## Quick Deployment to Render

Render is a modern cloud platform that makes deployment simple and works perfectly with Supabase.

### Why Render?

✅ **Free Tier**: Free for web services (with limitations)  
✅ **Easy Setup**: Deploy in 10 minutes  
✅ **Auto Deploy**: Automatic deployments from GitHub  
✅ **Works with Supabase**: Perfect IPv4/IPv6 compatibility  
✅ **Custom Domains**: Free SSL certificates  
✅ **Great Support**: Excellent documentation  

---

## Step-by-Step Deployment

### Step 1: Create Render Account

1. **Go to**: https://render.com
2. **Click**: "Get Started" or "Sign Up"
3. **Sign up with GitHub** (recommended for automatic deployments)
4. **Authorize Render** to access your GitHub repositories

### Step 2: Create New Web Service

1. **Click**: "New +" button (top right)
2. **Select**: "Web Service"
3. **Connect**: Your GitHub account (if not already connected)
4. **Choose**: `Diwan-Al-Maarifa` repository
5. **Click**: "Connect"

### Step 3: Configure the Service

Render will show a configuration form. Fill it in:

**Basic Settings:**
- **Name**: `diwan-maarifa-backend`
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Plan**: `Free` (select the free tier)

### Step 4: Add Environment Variables

Scroll down to "Environment Variables" section and add these:

**Click "Add Environment Variable"** for each:

```
NODE_ENV=production
PORT=3000

DB_HOST=db.zfqljfvxmvbnhbrqlwju.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=!Inf105090

DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000

JWT_SECRET=rHgp9KayaFYw0S/hh+Kf4lYIWzP9kqw3K3dIdbXSoDQ=
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=*
FRONTEND_URL=https://alhuwaidias-arch.github.io/Diwan-Al-Maarifa

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

BCRYPT_ROUNDS=10
SESSION_SECRET=rHgp9KayaFYw0S/hh+Kf4lYIWzP9kqw3K3dIdbXSoDQ=

ENABLE_REGISTRATION=true
ENABLE_COMMENTS=false
ENABLE_ANALYTICS=true
ENABLE_EMAIL_NOTIFICATIONS=false
```

**Important:** Make sure to add ALL variables before deploying!

### Step 5: Deploy!

1. **Click**: "Create Web Service" (bottom of page)
2. **Wait**: 3-5 minutes for build and deployment
3. **Monitor**: Check the logs in the dashboard

### Step 6: Get Your API URL

Once deployed, Render will provide a URL:
```
https://diwan-maarifa-backend.onrender.com
```

This is your public API URL!

---

## Testing Your Deployed API

### Health Check

```bash
curl https://diwan-maarifa-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T...",
  "database": "connected"
}
```

### API Root

```bash
curl https://diwan-maarifa-backend.onrender.com/
```

**Expected Response:**
```json
{
  "message": "ديوان المعرفة API",
  "version": "1.0.0",
  "status": "running"
}
```

### Register a User

```bash
curl -X POST https://diwan-maarifa-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "full_name": "Test User",
    "role": "contributor"
  }'
```

---

## Monitoring Your Deployment

### Render Dashboard

**View**:
- **Logs**: Real-time application logs
- **Metrics**: Response times, memory usage
- **Events**: Deployment history
- **Settings**: Configuration and environment variables

**Access Logs**:
1. Go to your service dashboard
2. Click on "Logs" tab
3. View real-time logs

### Check Database Connection

In Render logs, you should see:
```
Database connected at: 2025-12-11T...
✓ Server running on port 3000
```

---

## Free Tier Limitations

### What You Get (Free):

✅ **750 hours/month** of runtime  
✅ **512 MB RAM**  
✅ **Automatic SSL**  
✅ **Auto-deploy from GitHub**  
✅ **Custom domains**  

### Limitations:

⚠️ **Spins down after 15 minutes** of inactivity  
⚠️ **Cold starts** (takes 30-60 seconds to wake up)  
⚠️ **Limited bandwidth**  

**Note:** The free tier is perfect for development and testing. For production with real users, consider upgrading to the paid tier ($7/month).

---

## Preventing Cold Starts (Optional)

### Option 1: Use a Ping Service (Free)

Services like **UptimeRobot** or **Cron-job.org** can ping your API every 10 minutes to keep it awake.

**Setup**:
1. Go to https://uptimerobot.com
2. Add new monitor
3. URL: `https://your-api.onrender.com/health`
4. Interval: 10 minutes

### Option 2: Upgrade to Paid Plan

**Starter Plan**: $7/month
- ✅ No cold starts
- ✅ Always online
- ✅ More resources

---

## Custom Domain (Optional)

### Add Your Own Domain

1. **Go to**: Service Settings → "Custom Domains"
2. **Click**: "Add Custom Domain"
3. **Enter**: Your domain (e.g., `api.diwan-maarifa.com`)
4. **Add DNS Records**: Follow Render's instructions
5. **Wait**: DNS propagation (5-30 minutes)
6. **SSL**: Automatically provisioned

**DNS Records to Add**:
```
Type: CNAME
Name: api (or your subdomain)
Value: your-service.onrender.com
```

---

## Automatic Deployments

Render automatically deploys when you push to GitHub!

**How it Works**:
1. You push code to GitHub
2. Render detects the change
3. Automatically builds and deploys
4. Takes 3-5 minutes

**Manual Deploy**:
- Click "Manual Deploy" → "Deploy latest commit"
- Select specific branch or commit

---

## Environment Management

### Update Environment Variables

1. **Go to**: Service → "Environment"
2. **Edit**: Click on variable to modify
3. **Save**: Changes trigger automatic redeploy

### Secrets Management

For sensitive values (passwords, API keys):
- Use Render's environment variables (encrypted at rest)
- Never commit secrets to Git
- Rotate secrets regularly

---

## Troubleshooting

### Build Fails

**Check**:
- Root directory is set to `backend`
- `package.json` exists in backend folder
- All dependencies are listed

**Solution**:
- View build logs for specific error
- Ensure Node.js version is compatible (>=18.0.0)

### Deployment Succeeds but App Crashes

**Check**:
- Environment variables are set correctly
- Database connection is working
- Logs for error messages

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
- Test connection from Render logs
- Verify Supabase allows connections from Render IPs (it should by default)

### Slow Response Times

**Possible Causes**:
- Cold start (free tier)
- Database query optimization needed
- Too many requests

**Solution**:
- Use ping service to prevent cold starts
- Optimize database queries
- Consider upgrading to paid tier

---

## Cost Comparison

| Feature | Free Tier | Starter ($7/mo) | Standard ($25/mo) |
|---------|-----------|-----------------|-------------------|
| RAM | 512 MB | 2 GB | 4 GB |
| Always On | ❌ | ✅ | ✅ |
| Cold Starts | Yes | No | No |
| Bandwidth | Limited | 100 GB | 500 GB |
| Custom Domain | ✅ | ✅ | ✅ |
| SSL | ✅ | ✅ | ✅ |

---

## Scaling Up

### When to Upgrade

Consider paid plan when:
- You have real users (no cold starts)
- Need faster response times
- Exceeding free tier bandwidth
- Want guaranteed uptime

### Render Starter ($7/month)

**Includes**:
- 2 GB RAM
- No cold starts
- Always online
- 100 GB bandwidth
- Priority support

---

## Security Best Practices

### Environment Variables

✅ **Never commit** `.env` files  
✅ **Use Render variables** for secrets  
✅ **Rotate secrets** regularly  
✅ **Use different credentials** for each environment  

### Database Security

✅ **Use SSL** for database connections (enabled)  
✅ **Strong passwords** for database  
✅ **Limit CORS origins** in production  
✅ **Enable rate limiting** (configured)  

### API Security

✅ **HTTPS only** (Render provides SSL)  
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
- ✅ Render deployment history
- ✅ Local development machine

---

## Next Steps After Deployment

Once your backend is deployed:

1. ✅ **Test all endpoints** with the deployed URL
2. ✅ **Update frontend** to use the new API URL
3. ✅ **Configure custom domain** (optional)
4. ✅ **Set up monitoring** (UptimeRobot for free tier)
5. ✅ **Enable email notifications** when ready
6. ✅ **Build and deploy frontend**
7. ✅ **Deploy AI agent** for content review

---

## Render vs Railway Comparison

| Feature | Render | Railway |
|---------|--------|---------|
| **Supabase Compatibility** | ✅ Perfect | ❌ IPv6 issues |
| Free Tier | 750 hrs/mo | $5 credit/mo |
| Cold Starts | Yes (free) | No |
| Setup Difficulty | Easy | Easy |
| Documentation | Excellent | Excellent |
| **Recommendation** | ✅ For Supabase | For Railway DB |

---

## Support

**Render**:
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

**Diwan Al-Maarifa**:
- Repository: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa
- Issues: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa/issues

---

## Quick Reference

### Render URLs

**Dashboard**: https://dashboard.render.com  
**Docs**: https://render.com/docs  
**Pricing**: https://render.com/pricing  

### Your Project

**Repository**: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa  
**Database**: Supabase (db.zfqljfvxmvbnhbrqlwju.supabase.co)  
**API URL**: (will be assigned after deployment)  

### Important Commands

```bash
# Test health endpoint
curl https://your-api.onrender.com/health

# Test registration
curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test","role":"contributor"}'

# View logs (from Render CLI)
render logs

# Deploy manually (from Render dashboard)
# Click "Manual Deploy" button
```

---

**Deployment Time**: ~10 minutes  
**Difficulty**: Easy  
**Cost**: Free (with cold starts) or $7/month (always on)  
**Status**: Production-Ready ✅  
**Supabase Compatible**: ✅ Yes
