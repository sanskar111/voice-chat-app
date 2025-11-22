# Voice Chat Application Architecture

## Overview
This document outlines the high-level architecture for the Voice Chat Application. The system is designed to enable real-time voice and text communication in room-based environments.

## System Components

### 1. Frontend (Client)
- **Technology**: React (Vite), TypeScript, TailwindCSS.
- **Responsibilities**:
    - User Interface for Lobby and Chat Rooms.
    - WebRTC handling for voice media (capture microphone, play remote audio).
    - WebSocket client for signaling (joining rooms, exchanging ICE candidates) and text chat.
    - State management for active rooms and user status.

### 2. Backend (Server)
- **Technology**: Node.js, Express, Socket.io.
- **Responsibilities**:
    - **API**: REST endpoints for user authentication and room management (CRUD).
    - **Signaling Server**: Handles WebSocket connections to exchange WebRTC signaling data (SDP offers/answers, ICE candidates) between clients.
    - **Chat Relay**: Broadcasts text messages to all users in a specific room.
    - **Authentication**: Verifies user identity (JWT/Session).

### 3. Database
- **Technology**: PostgreSQL (Google Cloud SQL).
- **Schema**:
    - `Users`: ID, username, email, password_hash.
    - `Rooms`: ID, name, topic, language, created_by.
    - `Messages`: ID, room_id, user_id, content, timestamp (optional for persistence).

### 4. Infrastructure
- **Compute**: Google Cloud Run (Stateless containers).
- **Database**: Google Cloud SQL.
- **Networking**:
    - **STUN Server**: Public Google STUN servers (`stun:stun.l.google.com:19302`) to resolve public IPs.
    - **TURN Server**: (Optional for MVP) Relays traffic if P2P fails.

## Data Flow

### Voice Connection (WebRTC Mesh)
1.  **Join**: User A joins a room via WebSocket.
2.  **Discovery**: Server notifies existing users (User B, User C) in the room.
3.  **Signaling**:
    - User A creates a WebRTC PeerConnection for User B.
    - User A sends SDP Offer -> Server -> User B.
    - User B sends SDP Answer -> Server -> User A.
    - Both exchange ICE Candidates via Server.
4.  **Media**: Audio flows directly between User A and User B (P2P).

### Text Chat
1.  User A sends message -> Server (WebSocket).
2.  Server validates and broadcasts -> All Users in Room.

## Diagram
```mermaid
graph TD
    subgraph Client Side
        UA[User A (React)]
        UB[User B (React)]
    end

    subgraph Server Side
        LB[Load Balancer]
        App[Node.js App (Cloud Run)]
        DB[(PostgreSQL)]
    end

    UA -- WebSocket (Signaling/Chat) --> LB
    UB -- WebSocket (Signaling/Chat) --> LB
    LB --> App
    App -- Query --> DB

    UA -- WebRTC Audio (P2P) --> UB
```
