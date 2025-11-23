# Deployment Guide

Complete guide for deploying the Voice Chat Application using Google Cloud Run (backend) and Firebase Hosting (frontend) with Supabase PostgreSQL database.

## Prerequisites

Before deploying, ensure you have:
- ✅ Supabase PostgreSQL database (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- ✅ Google Cloud Platform account with billing enabled
- ✅ Firebase project created
- ✅ GitHub repository with code pushed

## Part 1: Manual Deployment (One-Time Setup)

### Step 1: Install Required Tools

```bash
# Install Google Cloud SDK
# macOS:
brew install --cask google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install

# Install Firebase CLI
npm install -g firebase-tools

# Verify installations
gcloud --version
firebase --version
```

### Step 2: Set Up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create voice-chat-app-prod --name="Voice Chat App"

# Set the project
gcloud config set project voice-chat-app-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Deploy Backend to Cloud Run

```bash
# Navigate to project root
cd /Users/sanskar/voice-chat-app

# Deploy backend
gcloud run deploy voice-chat-backend \
  --source ./backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres" \
  --set-env-vars JWT_SECRET="your_jwt_secret_here" \
  --set-env-vars FRONTEND_URL="https://your-firebase-app.web.app" \
  --set-env-vars GOOGLE_CLIENT_ID="your_google_client_id" \
  --set-env-vars GOOGLE_CLIENT_SECRET="your_google_client_secret" \
  --set-env-vars GOOGLE_CALLBACK_URL="https://voice-chat-backend-xxxxx-as.a.run.app/auth/google/callback" \
  --max-instances 10 \
  --memory 512Mi \
  --timeout 300

# Note the service URL (e.g., https://voice-chat-backend-xxxxx-as.a.run.app)
```

### Step 4: Set Up Firebase Hosting

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# When prompted:
# - Select: Create a new project or use existing
# - Public directory: frontend/dist
# - Configure as SPA: Yes
# - Set up GitHub Actions: No (we'll do this manually)
```

### Step 5: Build and Deploy Frontend

```bash
# Update frontend environment with backend URL
cd frontend

# Create .env file
echo "VITE_API_URL=https://voice-chat-backend-xxxxx-as.a.run.app" > .env

# Build the frontend
npm run build

# Deploy to Firebase
cd ..
firebase deploy --only hosting
```

## Part 2: Automated CI/CD Deployment

### Step 1: Create GCP Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Display the key (copy this entire JSON)
cat ~/gcp-key.json
```

### Step 2: Get Firebase Service Account

```bash
# Go to Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/settings/serviceaccounts/adminsdk

# Click "Generate new private key"
# Download the JSON file
```

### Step 3: Configure GitHub Secrets

Go to your GitHub repository: https://github.com/sanskar111/voice-chat-app/settings/secrets/actions

Add the following secrets:

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `GCP_PROJECT_ID` | `voice-chat-app-prod` | Your GCP project ID |
| `GCP_SA_KEY` | `{...full JSON...}` | Contents of `gcp-key.json` |
| `DATABASE_URL` | `postgresql://postgres:...` | From Supabase dashboard |
| `JWT_SECRET` | `random_string_here` | Generate with `openssl rand -hex 32` |
| `FIREBASE_SERVICE_ACCOUNT` | `{...full JSON...}` | Firebase service account key |
| `FIREBASE_PROJECT_ID` | `your-firebase-project` | From Firebase console |
| `BACKEND_URL` | `https://voice-chat-backend-xxx.a.run.app` | From first backend deployment |
| `FRONTEND_URL` | `https://your-firebase-app.web.app` | Firebase Hosting URL |
| `GOOGLE_CLIENT_ID` | `...` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `...` | Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `.../auth/google/callback` | Backend URL + path |

### Step 4: Update GitHub Actions Workflow

The workflow is already configured in `.github/workflows/deploy.yml`. It will:
1. Trigger on push to `main` branch
2. Deploy backend to Cloud Run
3. Build frontend with backend URL
4. Deploy frontend to Firebase Hosting

### Step 5: Test Automated Deployment

```bash
# Make a small change and push
git add .
git commit -m "test: trigger deployment"
git push origin main

# Watch the deployment
# Go to: https://github.com/sanskar111/voice-chat-app/actions
```

## Environment Variables Reference

### Backend (.env)
```bash
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
JWT_SECRET="your_secret_key"
PORT=3000
FRONTEND_URL="http://localhost:5173"
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

### Frontend (.env)
```bash
VITE_API_URL="https://voice-chat-backend-xxxxx.a.run.app"
```

### GitHub Secrets (for CI/CD)
- `GCP_PROJECT_ID`
- `GCP_SA_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_PROJECT_ID`
- `BACKEND_URL`

## Deployment Architecture

```
┌─────────────────┐
│   GitHub Repo   │
│  (Push to main) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   CI/CD Pipeline│
└────┬────────┬───┘
     │        │
     │        ▼
     │   ┌──────────────┐
     │   │ Cloud Build  │
     │   │ (Build Image)│
     │   └──────┬───────┘
     │          │
     │          ▼
     │   ┌──────────────┐      ┌──────────────┐
     │   │  Cloud Run   │◄─────┤  Supabase DB │
     │   │   (Backend)  │      │ (PostgreSQL) │
     │   └──────────────┘      └──────────────┘
     │
     ▼
┌──────────────┐
│   Firebase   │
│   Hosting    │
│  (Frontend)  │
└──────────────┘
```

## Cost Estimation (Free Tier)

### Google Cloud Run
- **Free tier**: 2 million requests/month
- **Memory**: 512 MB (stays within free tier for low traffic)
- **Billing**: $0 for <180,000 vCPU-seconds and <360,000 GiB-seconds per month

### Supabase (Free Tier)
- **Database**: 500 MB storage
- **Bandwidth**: 2 GB/month
- **Cost**: $0

### Firebase Hosting (Free Tier)
- **Storage**: 10 GB
- **Bandwidth**: 360 MB/day (~10 GB/month)
- **Cost**: $0

**Total Monthly Cost**: $0 (within free tiers)

## Monitoring & Logs

### Cloud Run Logs
```bash
# View backend logs
gcloud run services logs read voice-chat-backend --project=voice-chat-app-prod

# Follow logs in real-time
gcloud run services logs tail voice-chat-backend --project=voice-chat-app-prod
```

### Firebase Hosting
```bash
# View hosting info
firebase hosting:sites:list
```

### Supabase Dashboard
- Go to https://supabase.com/dashboard
- Monitor database usage, active connections, query performance

## Troubleshooting

### Backend Deployment Fails
```bash
# Check Cloud Run logs
gcloud run services describe voice-chat-backend --region=asia-south1

# Test locally with Docker
cd backend
docker build -t voice-chat-backend .
docker run -p 3000:3000 --env-file .env voice-chat-backend
```

### Frontend Build Fails
```bash
# Check if VITE_API_URL is set
cd frontend
cat .env

# Test build locally
npm run build
npm run preview
```

### Database Connection Issues
- Verify `DATABASE_URL` in Cloud Run environment variables
- Check Supabase project is not paused
- Test connection from local machine first

## Scaling Considerations

### When Traffic Increases
1. **Cloud Run Auto-scaling**: Automatically scales up to `max-instances`
2. **Supabase Upgrade**: Consider paid tier when DB > 500 MB
3. **CDN**: Firebase Hosting includes CDN by default
4. **Redis for Socket.io**: Add Redis adapter for multi-instance WebSocket support

### WebRTC Limitations
- **Mesh topology**: Works for 3-5 users per room
- **For larger rooms**: Consider SFU (Selective Forwarding Unit) like Mediasoup

## Security Checklist

- ✅ Environment variables stored as GitHub Secrets
- ✅ Supabase database password is strong
- ✅ JWT secret is cryptographically random
- ✅ HTTPS enforced (Cloud Run and Firebase auto-enable)
- ✅ CORS configured in backend
- ✅ Service account has minimal required permissions

## Next Steps After Deployment

1. **Test the application**:
   - Visit your Firebase hosting URL
   - Create an account
   - Create a room
   - Test voice and text chat

2. **Set up monitoring**:
   - Enable Cloud Run monitoring in GCP Console
   - Set up Supabase usage alerts
   - Monitor Firebase Hosting analytics

3. **Share your app**:
   - Share the Firebase URL with users
   - Consider custom domain setup

4. **Ongoing maintenance**:
   - Monitor free tier usage
   - Check logs for errors
   - Update dependencies regularly
