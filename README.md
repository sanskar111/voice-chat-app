# TalkSick - Real-Time Voice Chat Application

A real-time voice and text chat application built with Node.js, React, and WebRTC.

**Live App**: https://talksick.web.app

## Features
- **Voice Chat**: Real-time audio communication using WebRTC (Mesh topology).
- **Text Chat**: Instant messaging within rooms.
- **Rooms**: Create and join rooms based on topics or languages.
- **Google OAuth**: Secure authentication with Google accounts.
- **Lobby**: View active rooms and online user counts.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Prisma, PostgreSQL.
- **Infrastructure**: Google Cloud Run, Firebase Hosting, Supabase.

## Prerequisites
- Node.js (v18+)
- PostgreSQL
- Docker (optional, for containerization)

## Local Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd voice-chat-app
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file (see .env.example)
# Run database migrations (if applicable)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the App
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment (Google Cloud)

### Prerequisites
1.  **Google Cloud Project**: Create a project in GCP.
2.  **Cloud SQL**: Create a PostgreSQL instance and database.
3.  **Service Account**: Create a service account with `Cloud Run Admin`, `Storage Admin`, and `Service Account User` roles. Download the JSON key.
4.  **GitHub Secrets**: Add the following secrets to your GitHub repository:
    - `GCP_PROJECT_ID`: Your GCP Project ID.
    - `GCP_SA_KEY`: The content of your Service Account JSON key.
    - `DATABASE_URL`: Connection string for Cloud SQL (e.g., `postgresql://user:pass@host:5432/db`).
    - `JWT_SECRET`: A secure random string.

### Manual Deployment
```bash
# Authenticate
gcloud auth login
gcloud config set project [PROJECT_ID]

# Deploy Backend
gcloud run deploy talksick-backend \
  --source ./backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=[SUPABASE_URL],JWT_SECRET=[SECRET]

# Deploy Frontend
cd frontend && npm run build
firebase deploy --only hosting
```

## Scaling Considerations

### WebSocket Scaling
Socket.io requires "sticky sessions" (session affinity) because a client must maintain a persistent connection to the *same* server instance.
- **Cloud Run**: Supports session affinity. Enable it via:
  ```bash
  gcloud run services update talksick-backend --session-affinity
  ```
- **Redis Adapter**: For multiple instances to communicate (broadcast messages across servers), you **MUST** use the Socket.io Redis Adapter.
    1.  Set up a Redis instance (Google Cloud Memorystore).
    2.  Update `backend/src/socket.ts` to use `createAdapter` from `@socket.io/redis-adapter`.

### WebRTC Scaling
- **Mesh Topology**: Works fine for small rooms (3-5 users).
- **SFU (Selective Forwarding Unit)**: For larger rooms (10+ users), Mesh is inefficient. You would need to deploy an SFU like **Mediasoup** or **Jitsi Videobridge**.
## Deployment

For complete deployment instructions, see:
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Complete deployment guide (manual + CI/CD)
- **[SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)** - Supabase database setup

### Quick Start (Manual Deployment)

1. **Set up Supabase Database**
   - Create project at https://supabase.com
   - Select region close to India (Singapore/Mumbai)
   - Copy database connection string

2. **Deploy Backend to Cloud Run**
   ```bash
   gcloud run deploy talksick-backend \
     --source ./backend \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL=[SUPABASE_URL],JWT_SECRET=[SECRET]
   ```
   Note the deployed URL (e.g., `https://talksick-backend-xxx.asia-south1.run.app`)

3. **Deploy Frontend to Firebase**
   ```bash
   # Update .env with backend URL
   echo "VITE_API_URL=https://talksick-backend-xxx.asia-south1.run.app" > frontend/.env
   
   cd frontend && npm run build
   firebase deploy --only hosting
   ```

### Automated CI/CD

The repo includes GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys on push to `main`.

**Required GitHub Secrets**:
- `GCP_PROJECT_ID`, `GCP_SA_KEY`
- `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`
- `DATABASE_URL`, `JWT_SECRET`, `BACKEND_URL`

### Monitoring Supabase Usage

**Free Tier Limits**:
- Database: 500 MB
- Bandwidth: 2 GB/month
- Connections: 60 concurrent

**Monitor Usage**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings → Usage**
4. Watch database size and bandwidth

**Stay Within Limits**:
- Regularly clean up inactive rooms
- Optimize queries with Prisma
- Use connection pooling
- Archive old user data

