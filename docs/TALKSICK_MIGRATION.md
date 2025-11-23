# TalkSick Rebrand - Migration Summary

## 🎯 Overview

Successfully migrated from "voice-chat-app" to "**TalkSick**" brand with new URLs for all services.

## 📊 Service URLs

### Production URLs (Current)

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://talksick.web.app | ✅ Live |
| **Backend API** | https://talksick-backend-758892876672.asia-south1.run.app | ✅ Live |

### Legacy URLs (Deprecated - Still Running)

| Service | URL | Status |
|---------|-----|--------|
| Frontend (Old) | https://voice-chat-app-prod.web.app | ⚠️ Deprecated |
| Backend (Old) | https://voice-chat-backend-758892876672.asia-south1.run.app | ⚠️ Deprecated |

## 🔧 Changes Made

### 1. Backend Service
- **Service Name**: `talksick-backend`
- **Region**: `asia-south1`
- **URL**: `https://talksick-backend-758892876672.asia-south1.run.app`
- **Environment Variables Updated**:
  - `GOOGLE_CALLBACK_URL` → https://talksick-backend-758892876672.asia-south1.run.app/auth/google/callback
  - `FRONTEND_URL` → https://talksick.web.app

### 2. Frontend Hosting
- **Site ID**: `talksick`
- **URL**: `https://talksick.web.app`
- **Config Updated**:
  - `firebase.json` → Changed site from `voice-chat-app-prod` to `talksick`
  - `.env` → `VITE_API_URL` updated to new backend URL

### 3. Files Modified

#### Configuration Files
- `/frontend/.env` - Backend URL
- `/firebase.json` - Hosting site ID

#### No Code Changes Needed
- ✅ `axios.ts` already uses `import.meta.env.VITE_API_URL`
- ✅ All API calls use configured axios instance
- ✅ No hardcoded URLs in source code

## ⚠️ Required Manual Steps

### Google OAuth Console (CRITICAL)

**You must update these before the app will work:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select OAuth 2.0 Client ID
3. **Add Authorized redirect URIs**:
   ```
   https://talksick-backend-758892876672.asia-south1.run.app/auth/google/callback
   ```

4. **Add Authorized JavaScript origins**:
   ```
   https://talksick.web.app
   ```

5. Click **SAVE**

**Note**: Keep old URLs temporarily for rollback capability.

## 🧪 Verification Checklist

- [ ] OAuth URLs updated in Google Console
- [ ] Test login at https://talksick.web.app
- [ ] Verify rooms load correctly
- [ ] Test voice chat functionality
- [ ] Check browser console shows new URLs

## 📝 Deployment Commands (Updated)

### Backend Deployment
```bash
gcloud run deploy talksick-backend \
  --source ./backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=...,JWT_SECRET=...,GOOGLE_CLIENT_ID=...,GOOGLE_CLIENT_SECRET=...,GOOGLE_CALLBACK_URL=https://talksick-backend-758892876672.asia-south1.run.app/auth/google/callback,FRONTEND_URL=https://talksick.web.app"
```

### Frontend Deployment
```bash
# Update .env first
echo "VITE_API_URL=https://talksick-backend-758892876672.asia-south1.run.app" > frontend/.env

# Build and deploy
cd frontend && npm run build
cd .. && firebase deploy --only hosting
```

## 🗑️ Cleanup (Optional - Do Later)

Once verified stable for a few days:

1. Remove old OAuth redirect URIs from Google Console
2. Delete old Cloud Run service:
   ```bash
   gcloud run services delete voice-chat-backend --region asia-south1
   ```
3. Optionally delete old Firebase Hosting site (careful - may affect analytics)

## 📚 Documentation Updated

- ✅ `TALKSICK_OAUTH_SETUP.md` - OAuth configuration guide
- ⏳ `DEPLOYMENT.md` - Deployment instructions (update in progress)
- ✅ `task.md` - Rebrand checklist

## 🎓 Development Workflow

### Local Development
```bash
# Backend (in /backend)
npm run dev

# Frontend (in /frontend)
# Update .env.local for local backend
echo "VITE_API_URL=http://localhost:3000" > .env.local
npm run dev
```

### Production URLs to Use
- API calls: Automatically use `import.meta.env.VITE_API_URL`
- OAuth callbacks: Configured in backend env vars
- Frontend: Always deploy to `talksick` site

## 💡 Tips

1. **Both services are running** - Old and new URLs work (for rollback)
2. **Environment variables** - All URLs configured via env vars, not hardcoded
3. **Test in incognito** - Avoid cached credentials affecting tests
4. **Check console logs** - Axios interceptors log all API calls with full URLs

## 📞 Support References

- Firebase Console: https://console.firebase.google.com/project/voice-chat-app-prod
- Cloud Run Console: https://console.cloud.google.com/run?project=voice-chat-app-prod
- Google OAuth Console: https://console.cloud.google.com/apis/credentials?project=voice-chat-app-prod
