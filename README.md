# Voice Chat Application

A real-time voice and text chat application built with Node.js, React, and WebRTC.

## Features
- **Voice Chat**: Real-time audio communication using WebRTC (Mesh topology).
- **Text Chat**: Instant messaging within rooms.
- **Rooms**: Create and join rooms based on topics or languages.
- **Lobby**: View active rooms and online user counts.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, PostgreSQL.
- **Infrastructure**: Google Cloud Run, Cloud SQL.

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
gcloud builds submit --tag gcr.io/[PROJECT_ID]/voice-chat-backend ./backend
gcloud run deploy voice-chat-backend --image gcr.io/[PROJECT_ID]/voice-chat-backend --platform managed --allow-unauthenticated --set-env-vars DATABASE_URL=[DB_URL],JWT_SECRET=[SECRET]

# Deploy Frontend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/voice-chat-frontend ./frontend
gcloud run deploy voice-chat-frontend --image gcr.io/[PROJECT_ID]/voice-chat-frontend --platform managed --allow-unauthenticated
```

## Scaling Considerations

### WebSocket Scaling
Socket.io requires "sticky sessions" (session affinity) because a client must maintain a persistent connection to the *same* server instance.
- **Cloud Run**: Supports session affinity. Enable it via:
  ```bash
  gcloud run services update voice-chat-backend --session-affinity
  ```
- **Redis Adapter**: For multiple instances to communicate (broadcast messages across servers), you **MUST** use the Socket.io Redis Adapter.
    1.  Set up a Redis instance (Google Cloud Memorystore).
    2.  Update `backend/src/socket.ts` to use `createAdapter` from `@socket.io/redis-adapter`.

### WebRTC Scaling
- **Mesh Topology**: Works fine for small rooms (3-5 users).
- **SFU (Selective Forwarding Unit)**: For larger rooms (10+ users), Mesh is inefficient. You would need to deploy an SFU like **Mediasoup** or **Jitsi Videobridge**.
## Zero-Cost Deployment Guide

### 1. Backend (Google Cloud Run)
- **Prerequisites**: Google Cloud Project, Billing enabled (Free tier covers 2M requests/month).
- **Database**: Use **Neon** or **Supabase** for a free PostgreSQL database. Get the connection string.
- **Deploy**:
  ```bash
  gcloud run deploy voice-chat-backend --source ./backend --platform managed --allow-unauthenticated --set-env-vars DATABASE_URL=[NEON_DB_URL],JWT_SECRET=[SECRET]
  ```
- **Note URL**: Copy the URL provided by Cloud Run (e.g., `https://voice-chat-backend-xyz.a.run.app`).

### 2. Frontend (Firebase Hosting)
- **Prerequisites**: Firebase Project (can be same as GCP project).
- **Setup**:
  1. Install CLI: `npm install -g firebase-tools`
  2. Login: `firebase login`
  3. Init: `firebase init hosting` (Select `frontend/dist` as public directory, Yes to SPA).
- **Build & Deploy**:
  ```bash
  cd frontend
  # Set the backend URL
  export VITE_API_URL=https://voice-chat-backend-xyz.a.run.app
  npm run build
  firebase deploy
  ```

### 3. CI/CD (GitHub Actions)
To automate this, add the following secrets to your GitHub Repo:
- `GCP_PROJECT_ID`, `GCP_SA_KEY` (for Backend)
- `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID` (for Frontend)
- `BACKEND_URL` (The Cloud Run URL, used by frontend build)
- `DATABASE_URL`, `JWT_SECRET`

