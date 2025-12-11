# Database Deployment Guide - Diwan Al-Maarifa

## Current Database Status

### Development Environment (Sandbox)

**Location**: Local PostgreSQL instance in the Manus sandbox  
**Status**: ✅ Active and Running  
**Database Name**: `diwan_maarifa`  
**User**: `diwan_user`  
**Size**: 9.5 MB  
**Tables**: 9 tables with complete schema  

**Connection Details**:
```
Host: localhost
Port: 5432
Database: diwan_maarifa
User: diwan_user
Password: diwan_password_2024
```

**Tables Created**:
- ✅ users (authentication and profiles)
- ✅ categories (content categories)
- ✅ content_submissions (workflow management)
- ✅ published_content (published content)
- ✅ workflow_history (audit trail)
- ✅ notifications (user notifications)
- ✅ analytics_events (usage tracking)
- ✅ comments (user engagement)
- ✅ user_sessions (session management)

---

## ⚠️ Important: This is a Development Database

The current database is **only for development and testing**. It exists in the Manus sandbox environment and will be cleared when the sandbox is reset.

### What This Means:

❌ **NOT for production use**  
❌ **NOT accessible from the internet**  
❌ **NOT persistent** (sandbox data is temporary)  
❌ **NOT backed up**  

✅ **ONLY for local development**  
✅ **ONLY for testing the backend API**  
✅ **ONLY for schema validation**  

---

## Production Database Deployment Options

To deploy your platform for real users, you need to set up a production database. Here are your options:

### Option 1: Managed PostgreSQL Services (Recommended)

#### A. AWS RDS (Amazon Web Services)
**Best for**: Enterprise-grade reliability and scalability

**Pros**:
- Automated backups
- High availability
- Easy scaling
- Automatic updates
- 99.95% uptime SLA

**Pricing**:
- db.t3.micro (1GB RAM): ~$15/month
- db.t3.small (2GB RAM): ~$30/month
- db.t3.medium (4GB RAM): ~$60/month

**Setup Steps**:
1. Create AWS account
2. Go to RDS console
3. Create PostgreSQL database
4. Choose instance size
5. Configure security groups
6. Get connection endpoint

**Connection String**:
```
postgresql://username:password@your-db.region.rds.amazonaws.com:5432/diwan_maarifa
```

---

#### B. DigitalOcean Managed Databases
**Best for**: Simple setup and transparent pricing

**Pros**:
- Easy to use
- Transparent pricing
- Good performance
- Automatic backups
- Free SSL certificates

**Pricing**:
- Basic (1GB RAM, 10GB storage): $15/month
- Professional (2GB RAM, 25GB storage): $30/month
- Advanced (4GB RAM, 50GB storage): $60/month

**Setup Steps**:
1. Create DigitalOcean account
2. Go to Databases section
3. Create PostgreSQL cluster
4. Choose datacenter region (nearest to users)
5. Select plan
6. Get connection details

**Connection String**:
```
postgresql://username:password@your-db-do-user.db.ondigitalocean.com:25060/diwan_maarifa?sslmode=require
```

---

#### C. Supabase (PostgreSQL + Backend Services)
**Best for**: Quick deployment with built-in features

**Pros**:
- Free tier available
- Built-in authentication
- Real-time subscriptions
- Auto-generated REST API
- Dashboard included

**Pricing**:
- Free: Up to 500MB database, 2GB bandwidth
- Pro: $25/month (8GB database, 50GB bandwidth)
- Team: $599/month (unlimited)

**Setup Steps**:
1. Go to supabase.com
2. Create new project
3. Choose region
4. Get connection string
5. Run schema SQL in SQL editor

**Connection String**:
```
postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
```

---

#### D. Neon (Serverless PostgreSQL)
**Best for**: Pay-per-use, auto-scaling

**Pros**:
- Serverless (auto-sleep when idle)
- Instant branching
- Free tier available
- Pay only for what you use
- Fast cold starts

**Pricing**:
- Free: 0.5GB storage, 100 hours compute
- Pro: $19/month + usage
- Scale: Custom pricing

**Setup Steps**:
1. Go to neon.tech
2. Create project
3. Get connection string
4. Deploy schema

**Connection String**:
```
postgresql://username:password@ep-name.region.aws.neon.tech/diwan_maarifa?sslmode=require
```

---

### Option 2: Self-Hosted PostgreSQL

#### A. VPS (Virtual Private Server)
**Best for**: Full control and cost optimization

**Providers**:
- DigitalOcean Droplets: $6-12/month
- Linode: $5-10/month
- Vultr: $6-12/month
- Hetzner: €4-8/month (cheapest)

**Setup Steps**:
1. Create VPS instance (Ubuntu 22.04)
2. Install PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```
3. Configure PostgreSQL:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE diwan_maarifa;
   CREATE USER diwan_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE diwan_maarifa TO diwan_user;
   ```
4. Configure firewall (allow port 5432 from backend server only)
5. Set up SSL certificates
6. Configure automated backups

**Pros**:
- Full control
- Lower cost for small projects
- Can run backend on same server

**Cons**:
- Manual backups required
- Manual security updates
- More maintenance work
- No automatic scaling

---

## Deployment Steps for Production

### Step 1: Choose Your Database Provider
Select one of the options above based on your needs and budget.

### Step 2: Create Database Instance
Follow the provider's setup instructions to create your PostgreSQL database.

### Step 3: Run Database Schema
Use the schema file from the repository:

```bash
# Download schema file
cd database/schema

# Run schema on production database
PGPASSWORD='your_password' psql -h your-host -U your-user -d diwan_maarifa -f 01_create_tables.sql
```

Or use the automated setup script:
```bash
cd database
./setup_database.sh
```

### Step 4: Configure Backend Connection
Update your backend `.env` file with production database credentials:

```env
DB_HOST=your-production-host.com
DB_PORT=5432
DB_NAME=diwan_maarifa
DB_USER=your_user
DB_PASSWORD=your_secure_password
```

### Step 5: Test Connection
Test the connection from your backend:

```bash
cd backend
npm run test:db
```

### Step 6: Migrate Existing Data (Optional)
If you have existing content in JSON files:

```bash
cd backend
node src/database/migrate_existing_content.js
```

### Step 7: Set Up Backups
Configure automated backups:

**For Managed Services**: Usually automatic  
**For Self-Hosted**: Set up pg_dump cron job:

```bash
# Add to crontab (daily backup at 2 AM)
0 2 * * * pg_dump -h localhost -U diwan_user diwan_maarifa > /backups/diwan_$(date +\%Y\%m\%d).sql
```

### Step 8: Monitor Database
Set up monitoring for:
- Connection count
- Query performance
- Disk usage
- CPU usage
- Memory usage

---

## Security Best Practices

### 1. Strong Passwords
Use strong, unique passwords for database users:
```bash
# Generate secure password
openssl rand -base64 32
```

### 2. Firewall Rules
Only allow connections from your backend server:
```bash
# Example: Allow only specific IP
sudo ufw allow from YOUR_BACKEND_IP to any port 5432
```

### 3. SSL/TLS Encryption
Always use SSL for database connections:
```env
DB_SSL=true
```

### 4. Regular Backups
- Daily automated backups
- Weekly full backups
- Test restore procedures monthly

### 5. User Permissions
Use principle of least privilege:
```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

### 6. Connection Pooling
Use connection pooling (already implemented in backend):
```javascript
max: 20,  // Maximum connections
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 2000
```

---

## Cost Comparison

| Provider | Entry Plan | Mid Plan | High Plan | Notes |
|----------|-----------|----------|-----------|-------|
| **AWS RDS** | $15/mo | $60/mo | $200+/mo | Enterprise features |
| **DigitalOcean** | $15/mo | $30/mo | $60/mo | Simple pricing |
| **Supabase** | Free | $25/mo | $599/mo | Includes backend |
| **Neon** | Free | $19/mo | Custom | Serverless |
| **Self-Hosted VPS** | $6/mo | $12/mo | $24/mo | Requires management |

### Recommendations by Stage:

**Development/Testing**: 
- ✅ Supabase Free Tier
- ✅ Neon Free Tier

**Small Launch (< 1,000 users)**:
- ✅ DigitalOcean Basic ($15/mo)
- ✅ Self-Hosted VPS ($6-12/mo)

**Growing (1,000 - 10,000 users)**:
- ✅ DigitalOcean Professional ($30/mo)
- ✅ AWS RDS t3.small ($30/mo)

**Scale (10,000+ users)**:
- ✅ AWS RDS t3.medium+ ($60+/mo)
- ✅ Multiple replicas with load balancing

---

## Migration from Development to Production

### Step 1: Export Schema
```bash
pg_dump -h localhost -U diwan_user -d diwan_maarifa --schema-only > schema.sql
```

### Step 2: Export Data (if needed)
```bash
pg_dump -h localhost -U diwan_user -d diwan_maarifa --data-only > data.sql
```

### Step 3: Import to Production
```bash
psql -h production-host -U production-user -d diwan_maarifa < schema.sql
psql -h production-host -U production-user -d diwan_maarifa < data.sql
```

### Step 4: Verify
```bash
psql -h production-host -U production-user -d diwan_maarifa -c "\dt"
```

---

## Troubleshooting

### Connection Refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port is open
sudo netstat -plnt | grep 5432
```

### Authentication Failed
```bash
# Check pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add line for your IP
host    all    all    YOUR_IP/32    md5
```

### Too Many Connections
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Increase max connections
ALTER SYSTEM SET max_connections = 100;
```

---

## Next Steps

1. **Choose a database provider** based on your budget and requirements
2. **Create production database** following provider instructions
3. **Run database schema** using provided SQL files
4. **Update backend configuration** with production credentials
5. **Test connection** from backend to database
6. **Set up automated backups**
7. **Configure monitoring**

---

## Need Help?

If you need assistance with:
- Choosing the right database provider
- Setting up production database
- Migrating data
- Configuring backups
- Performance optimization

Let me know and I can guide you through the process!

---

**Document Version**: 1.0  
**Last Updated**: December 10, 2025  
**Status**: Ready for Production Deployment
