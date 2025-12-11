# Supabase Database Setup Guide - Diwan Al-Maarifa

## Step-by-Step Setup Instructions

### Step 1: Create Supabase Account

1. **Go to Supabase**: https://supabase.com
2. **Click "Start your project"** (green button in the top right)
3. **Sign up** with one of these options:
   - GitHub account (recommended)
   - Google account
   - Email and password

### Step 2: Create New Project

After signing in, you'll see the Supabase dashboard.

1. **Click "New Project"** or "Create a new project"
2. **Fill in the project details**:
   
   **Project Name**: `diwan-al-maarifa`  
   **Database Password**: Generate a strong password (click the "Generate" button)  
   ⚠️ **IMPORTANT**: Save this password! You'll need it later.  
   
   **Region**: Choose the closest to your users:
   - Middle East users → `West Asia (Mumbai)` or `Southeast Asia (Singapore)`
   - Global → `US East (North Virginia)`
   
   **Pricing Plan**: Free (default)

3. **Click "Create new project"**

⏳ Wait 2-3 minutes while Supabase creates your database...

### Step 3: Get Connection Details

Once your project is ready:

1. **Go to Project Settings** (gear icon in the left sidebar)
2. **Click "Database"** in the settings menu
3. **Scroll down to "Connection string"**
4. **Copy the connection details**:
   - Host
   - Database name
   - Port
   - User
   - Password (the one you generated earlier)

Or copy the full **Connection String** (it looks like this):
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 4: Run Database Schema

Now we need to create all the tables in your new database.

**Option A: Using Supabase SQL Editor (Easiest)**

1. **In Supabase Dashboard**, click "SQL Editor" in the left sidebar
2. **Click "New query"**
3. **Copy the entire schema** from the file I'll provide
4. **Paste it into the SQL editor**
5. **Click "Run"** (or press Ctrl+Enter)
6. ✅ You should see "Success. No rows returned"

**Option B: Using Command Line**

```bash
# Navigate to database directory
cd /path/to/Diwan-Al-Maarifa/database/schema

# Run schema (replace with your connection details)
psql "postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f 01_create_tables.sql
```

### Step 5: Verify Tables Created

In Supabase Dashboard:

1. **Click "Table Editor"** in the left sidebar
2. **You should see 9 tables**:
   - users
   - categories
   - content_submissions
   - published_content
   - workflow_history
   - notifications
   - analytics_events
   - comments
   - user_sessions

✅ If you see all 9 tables, your database is ready!

### Step 6: Update Backend Configuration

Now we need to tell your backend to use the Supabase database instead of localhost.

**Create/Update `.env` file** in the `backend` folder:

```env
# Server
NODE_ENV=production
PORT=3000

# Supabase Database Connection
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.xxxxxxxxxxxxx
DB_PASSWORD=your_database_password_here

# JWT
JWT_SECRET=your_jwt_secret_here_change_this_to_random_string
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=*

# Frontend URL
FRONTEND_URL=https://alhuwaidias-arch.github.io/Diwan-Al-Maarifa

# Email (Optional - can configure later)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASSWORD=your_app_password
# EMAIL_FROM=noreply@diwan-maarifa.com
```

**Important Notes**:
- Replace `xxxxxxxxxxxxx` with your actual project reference
- Replace `your_database_password_here` with the password you generated
- Generate a new JWT_SECRET (use: `openssl rand -base64 32`)
- Keep the port as `6543` (Supabase connection pooler)
- Database name is `postgres` (Supabase default)

### Step 7: Test Connection

Test if your backend can connect to Supabase:

```bash
cd backend
npm run dev
```

You should see:
```
✓ Database connected successfully
✓ Server running on port 3000
```

### Step 8: Security Settings (Optional but Recommended)

In Supabase Dashboard:

1. **Go to Project Settings → Database**
2. **Enable SSL Mode**: Already enabled by default ✅
3. **Connection Pooling**: Already enabled ✅

---

## What You Get with Supabase Free Tier

✅ **500 MB Database** - Enough for thousands of articles  
✅ **Unlimited API Requests**  
✅ **50,000 Monthly Active Users**  
✅ **2 GB Bandwidth**  
✅ **Automatic Backups** (7 days retention)  
✅ **SSL Encryption**  
✅ **Connection Pooling**  
✅ **Dashboard & SQL Editor**  
✅ **Real-time Database** (if you want to use it later)  
✅ **Built-in Authentication** (if you want to migrate from JWT)  

---

## Troubleshooting

### Connection Refused
- Check if you're using the correct host (should end with `.supabase.com`)
- Verify port is `6543` (not `5432`)
- Make sure password is correct

### Authentication Failed
- Double-check your database password
- Make sure you're using the full user name (e.g., `postgres.xxxxxxxxxxxxx`)

### SSL Required Error
Add to your `.env`:
```env
DB_SSL=true
```

### Tables Not Created
- Make sure you ran the entire schema SQL
- Check for error messages in the SQL Editor
- Verify you have the correct permissions

---

## Next Steps After Setup

Once your database is running on Supabase:

1. ✅ **Backend connects to production database**
2. ✅ **Data is persistent** (won't be lost)
3. ✅ **Accessible from anywhere**
4. ✅ **Automatic backups**
5. ✅ **Ready for deployment**

You can now:
- Deploy your backend to a hosting service
- Build and deploy the frontend
- Start adding real content
- Invite users to test

---

## Monitoring Your Database

**In Supabase Dashboard**:

1. **Database → Reports** - See usage statistics
2. **Table Editor** - View and edit data
3. **SQL Editor** - Run custom queries
4. **Logs** - View database logs
5. **Backups** - Manage backups (Pro plan)

**Free Tier Limits**:
- Database size: 500 MB
- Bandwidth: 2 GB/month
- If you exceed, Supabase will notify you

---

## When to Upgrade

Consider upgrading to **Pro Plan ($25/month)** when:
- Database exceeds 400 MB
- You have 10,000+ active users
- You need daily backups
- You need priority support
- You want custom domains

---

## Support

**Supabase Documentation**: https://supabase.com/docs  
**Community Discord**: https://discord.supabase.com  
**Status Page**: https://status.supabase.com  

---

**Setup Time**: ~10 minutes  
**Difficulty**: Easy  
**Cost**: Free  
**Status**: Production-Ready ✅
