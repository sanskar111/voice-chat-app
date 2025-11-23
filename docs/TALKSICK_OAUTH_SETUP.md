# TalkSick Rebrand - OAuth Configuration Guide

## ✅ Completed Steps

### Backend
- ✅ New Cloud Run service deployed: `talksick-backend`
- ✅ Service URL: `https://talksick-backend-758892876672.asia-south1.run.app`
- ✅ Environment variables updated:
  - `GOOGLE_CALLBACK_URL`: `https://talksick-backend-758892876672.asia-south1.run.app/auth/google/callback`
  - `FRONTEND_URL`: `https://talksick.web.app`

### Frontend
- ✅ Firebase Hosting site created: `talksick`
- ✅ Deployed to: `https://talksick.web.app`
- ✅ Frontend `.env` updated with new backend URL
- ✅ Firebase config files updated

## 🔧 Required: Update Google OAuth Configuration

You must manually update your Google Cloud Console OAuth 2.0 Client settings.

### Steps:

1. **Go to Google Cloud Console**:
   - Navigate to: https://console.cloud.google.com/apis/credentials
   - Select your project: `voice-chat-app-prod`
   - Click on your OAuth 2.0 Client ID

2. **Add Authorized Redirect URIs**:
   In the "Authorized redirect URIs" section, add:
   ```
   https://talksick-backend-758892876672.asia-south1.run.app/auth/google/callback
   ```
   
   **Keep the old URL temporarily for rollback**:
   ```
   https://voice-chat-backend-758892876672.asia-south1.run.app/auth/google/callback
   ```

3. **Add Authorized JavaScript Origins**:
   In the "Authorized JavaScript origins" section, add:
   ```
   https://talksick.web.app
   ```
   
   **Keep the old URL temporarily for rollback**:
   ```
   https://voice-chat-app-prod.web.app
   ```

4. **Click "SAVE"** at the bottom of the page

## 🧪 Verification Steps

After updating OAuth configuration:

1. Open **incognito/private window**
2. Navigate to: `https://talksick.web.app`
3. Click "Continue with Google"
4. Select your Google account
5. **Expected**: You should be redirected to lobby, NOT see `redirect_uri_mismatch` error

### Browser DevTools Checks:

Open DevTools (F12) → Console, verify logs:
```
[Axios Config] Base URL: https://talksick-backend-758892876672.asia-south1.run.app
[API Request] GET /rooms
[API Response] { status: 200, dataType: "array(...)" }
```

### Network Tab:
- Check that `/rooms` API call goes to `talksick-backend-...` URL
- Check that WebSocket connects to new backend URL

## 📋 Summary of URL Changes

| Component | Old URL | New URL |
|-----------|---------|---------|
| **Frontend** | `https://voice-chat-app-prod.web.app` | `https://talksick.web.app` |
| **Backend** | `https://voice-chat-backend-758892876672.asia-south1.run.app` | `https://talksick-backend-758892876672.asia-south1.run.app` |
| **OAuth Callback** | Old backend `/auth/google/callback` | New backend `/auth/google/callback` |
| **Frontend Callback** | Old frontend `/auth/callback` | New frontend `/auth/callback` |

## ⚠️ Important Notes

- **Both services are running**: Old and new URLs are both active
- **Roll back if needed**: If issues occur, you can revert to old URLs
- **Remove old URLs later**: Once verified stable, remove old OAuth URIs from Google Console

## 🎯 Next Steps

1. Update Google OAuth Console (see above)
2. Test login flow on `https://talksick.web.app`
3. Verify all features work (chat, voice, rooms)
4. Once verified, optionally shut down old services
