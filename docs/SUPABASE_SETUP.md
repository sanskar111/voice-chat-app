# Supabase Database Setup Guide

This guide will walk you through setting up a PostgreSQL database on Supabase for your voice chat application.

## Step 1: Create a Supabase Account & Project

1. **Sign in to Supabase**
   - Go to https://supabase.com/dashboard/sign-in
   - Sign in with GitHub, Google, or email

2. **Create a New Project**
   - Click **"New Project"** in your organization
   - Fill in the project details:
     - **Name**: `voice-chat-app`
     - **Database Password**: Generate a strong password and **save it securely**
     - **Region**: Select **Southeast Asia (Singapore)** or **Mumbai, India** (closest to India)
     - **Pricing Plan**: Free tier (500 MB database, 2 GB bandwidth/month)

3. **Wait for Project Initialization**
   - This takes 1-2 minutes
   - You'll see a progress indicator

## Step 2: Get Database Connection Details

Once your project is ready:

1. **Navigate to Project Settings**
   - Click the **Settings** icon (⚙️) in the left sidebar
   - Go to **Database** section

2. **Copy Connection String**
   - Under **Connection String** section, select **URI** mode
   - Copy the connection string that looks like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with the password you set during project creation

3. **Note Individual Connection Details**
   For reference, also note:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: The password you created

## Step 3: Update Local Environment

1. **Update Backend `.env` file**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` with your Supabase credentials**
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
   JWT_SECRET="your_random_secret_key_here"
   PORT=3000
   ```

3. **Generate JWT Secret** (if you don't have one)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 4: Run Database Migrations

Create and apply migrations to set up your database schema:

```bash
cd backend

# Generate migration files
npx prisma migrate dev --name init

# This will:
# 1. Create migration SQL files
# 2. Apply them to your Supabase database
# 3. Generate Prisma Client
```

## Step 5: Verify Database Setup

1. **Check Tables in Supabase Dashboard**
   - Go to **Table Editor** in Supabase dashboard
   - You should see three tables:
     - `User`
     - `Room`
     - `RoomParticipant`

2. **Test Connection Locally**
   ```bash
   cd backend
   npm run dev
   ```
   - If successful, your backend should connect to Supabase without errors

## Step 6: Set Up GitHub Secrets for CI/CD

For automated deployment, add these secrets to your GitHub repository:

1. **Go to GitHub Repo Settings**
   - Navigate to `Settings` → `Secrets and variables` → `Actions`
   - Click **"New repository secret"**

2. **Add Required Secrets**
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Your JWT secret key
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Your GCP service account JSON key
   - `FIREBASE_SERVICE_ACCOUNT`: Firebase service account key
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID

## Monitoring & Free Tier Limits

### Supabase Free Tier Limits
- **Database Size**: 500 MB
- **Bandwidth**: 2 GB/month
- **Edge Functions**: 500,000 invocations/month
- **Storage**: 1 GB
- **Concurrent Connections**: 60

### How to Monitor Usage

1. **View Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **"Settings"** → **"Usage"**

2. **Key Metrics to Watch**
   - **Database size**: Keep your data under 500 MB
   - **Bandwidth**: Monitor API requests
   - **Active connections**: Ensure you're closing database connections properly

3. **Database Size Optimization**
   ```sql
   -- Check table sizes
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

### Best Practices to Stay Within Limits

1. **Cleanup Old Data**
   - Regularly remove inactive rooms
   - Consider archiving old user data

2. **Optimize Queries**
   - Use Prisma's query optimization
   - Add proper indexes (already in schema)

3. **Connection Pooling**
   - Use Prisma's connection pooling
   - Close connections when not in use

4. **Monitor in Production**
   - Set up alerts for 80% usage thresholds
   - Check dashboard weekly

## Database Schema Overview

Your database includes these tables with indexes for performance:

### Users Table
- Stores user credentials and profile data
- Indexed on `email` for fast lookups

### Rooms Table
- Stores voice chat rooms
- Tracks room metadata (name, topic, language)
- Links to host user

### RoomParticipants Table
- Tracks active participants in rooms
- Prevents duplicate joins with unique constraint
- Indexed for efficient queries

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project is not paused (free tier pauses after 7 days of inactivity)
- Ensure password has no special characters that need URL encoding

### Migration Errors
- Delete `backend/prisma/migrations` folder and re-run if needed
- Check Supabase dashboard for existing tables

### Performance Issues
- Monitor query performance in Supabase dashboard
- Use Prisma's query optimization features
- Consider upgrading if you exceed free tier consistently

## Next Steps

After setting up Supabase:
1. ✅ Database is configured
2. → Deploy backend to Google Cloud Run
3. → Connect frontend to deployed backend
4. → Test end-to-end functionality
