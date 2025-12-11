# Production Deployment Guide - Diwan Al-Maarifa

## ✅ Database Deployment Complete!

Your production database is now live on Supabase!

### Database Details

**Provider**: Supabase (Free Tier)  
**Database**: PostgreSQL 15  
**Host**: `db.zfqljfvxmvbnhbrqlwju.supabase.co`  
**Status**: ✅ Active  
**Tables**: 9 tables created  
**Categories**: 6 default categories inserted  

---

## Backend Configuration

### Environment File Created

I've created `.env.production` with all the necessary configuration:

**Location**: `/backend/.env.production`

**Key Settings**:
- ✅ Database connection to Supabase
- ✅ SSL enabled for secure connections
- ✅ JWT secret generated
- ✅ CORS configured
- ✅ Connection pooling optimized

### SSL Support Added

The backend database connection now supports SSL, which is required for Supabase and other cloud database providers.

---

## How to Use

### For Local Development with Production Database

1. **Copy the production environment file**:
   ```bash
   cd backend
   cp .env.production .env
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Verify connection**:
   - You should see: "✓ Database connected successfully"
   - The backend will connect to your Supabase database

---

## Testing the Production Database

### Test Backend Connection

```bash
cd backend
NODE_ENV=production npm start
```

**Expected Output**:
```
Database connected at: 2025-12-11T...
✓ Server running on port 3000
```

### Test API Endpoints

**Health Check**:
```bash
curl http://localhost:3000/health
```

**Register a User**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "full_name": "Test User",
    "role": "contributor"
  }'
```

---

## Deploying Backend to Production

Now that your database is ready, you can deploy your backend to a hosting service.

### Recommended Hosting Options

#### Option 1: Railway (Easiest)
**Cost**: Free tier available  
**Deployment Time**: 5 minutes  

**Steps**:
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `Diwan-Al-Maarifa` repository
5. Set environment variables from `.env.production`
6. Deploy!

#### Option 2: Render
**Cost**: Free tier available  
**Deployment Time**: 10 minutes  

**Steps**:
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. New → Web Service
4. Connect `Diwan-Al-Maarifa` repository
5. Root directory: `backend`
6. Build command: `npm install`
7. Start command: `npm start`
8. Add environment variables
9. Deploy!

#### Option 3: Heroku
**Cost**: $5-7/month (no free tier)  
**Deployment Time**: 15 minutes  

**Steps**:
1. Install Heroku CLI
2. `heroku create diwan-maarifa-api`
3. `git subtree push --prefix backend heroku main`
4. Set environment variables: `heroku config:set KEY=VALUE`
5. Done!

#### Option 4: DigitalOcean App Platform
**Cost**: $5/month  
**Deployment Time**: 10 minutes  

**Steps**:
1. Go to DigitalOcean
2. Create → Apps
3. Connect GitHub repository
4. Configure: Node.js, backend folder
5. Add environment variables
6. Deploy!

---

## Environment Variables for Deployment

When deploying, you need to set these environment variables:

```env
NODE_ENV=production
PORT=3000

# Database (from Supabase)
DB_HOST=db.zfqljfvxmvbnhbrqlwju.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=!Inf105090

# JWT
JWT_SECRET=rHgp9KayaFYw0S/hh+Kf4lYIWzP9kqw3K3dIdbXSoDQ=
JWT_EXPIRES_IN=24h

# CORS (update with your actual domain)
CORS_ORIGIN=https://alhuwaidias-arch.github.io

# Frontend
FRONTEND_URL=https://alhuwaidias-arch.github.io/Diwan-Al-Maarifa
```

---

## Security Checklist

Before going live, ensure:

- ✅ Database password is strong
- ✅ JWT secret is randomly generated
- ✅ SSL is enabled for database connections
- ✅ CORS is configured with specific origins (not `*`)
- ✅ Rate limiting is enabled
- ✅ Environment variables are not in Git
- ✅ `.env` files are in `.gitignore`

---

## Monitoring Your Database

### Supabase Dashboard

**Monitor**:
- Database size (Free tier: 500 MB limit)
- Active connections
- Query performance
- Table sizes

**Access**:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Check "Database" → "Reports"

### Database Usage

**Check Current Size**:
```sql
SELECT pg_size_pretty(pg_database_size('postgres'));
```

**Check Table Sizes**:
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Backup Strategy

### Automatic Backups

Supabase Free Tier includes:
- ✅ 7 days of backup retention
- ✅ Point-in-time recovery
- ✅ Automatic daily backups

### Manual Backup

**Export Database**:
```bash
pg_dump "postgresql://postgres:!Inf105090@db.zfqljfvxmvbnhbrqlwju.supabase.co:5432/postgres" > backup.sql
```

**Restore from Backup**:
```bash
psql "postgresql://postgres:!Inf105090@db.zfqljfvxmvbnhbrqlwju.supabase.co:5432/postgres" < backup.sql
```

---

## Scaling Considerations

### When to Upgrade from Free Tier

Consider upgrading to **Supabase Pro ($25/month)** when:

- Database size exceeds 400 MB (80% of limit)
- You have 10,000+ monthly active users
- You need daily backups instead of weekly
- You want priority support
- You need custom domains

### Performance Optimization

**Enable Connection Pooling** (already configured):
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

**Add Indexes** (already done):
- All foreign keys indexed
- Search fields indexed
- Commonly queried fields indexed

---

## Troubleshooting

### Connection Issues

**Error**: "Connection refused"
- Check if database host is correct
- Verify port (5432 for Supabase)
- Ensure SSL is enabled

**Error**: "Authentication failed"
- Verify database password
- Check username format

**Error**: "SSL required"
- Ensure `NODE_ENV=production` is set
- Check SSL configuration in connection.js

### Performance Issues

**Slow Queries**:
- Check Supabase dashboard for slow queries
- Add indexes if needed
- Optimize query patterns

**Too Many Connections**:
- Check connection pool settings
- Ensure connections are being released
- Monitor active connections in Supabase

---

## Next Steps

Now that your database is deployed:

1. ✅ **Backend is configured** to connect to production database
2. ⏭️ **Deploy backend** to a hosting service (Railway, Render, etc.)
3. ⏭️ **Build frontend** React application
4. ⏭️ **Build AI agent** for content review
5. ⏭️ **Set up email** notifications
6. ⏭️ **Configure custom domain**

---

## Support

**Supabase**:
- Documentation: https://supabase.com/docs
- Community: https://discord.supabase.com
- Status: https://status.supabase.com

**Diwan Al-Maarifa**:
- Repository: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa
- Issues: https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa/issues

---

**Deployment Status**: ✅ Database Ready for Production  
**Last Updated**: December 11, 2025  
**Version**: 1.0
