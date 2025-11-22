# Final Report: Voice Chat Application

## 1. Load Testing Strategy
We utilize **k6** to simulate concurrent WebSocket connections.
- **Script**: `tests/load-test.js`
- **Scenario**: Ramp up to 50 concurrent users, sending chat messages every second.
- **Metrics**: Connection success rate, Message latency.

### Running the Test
```bash
# Install k6
brew install k6

# Run test
k6 run tests/load-test.js
```

## 2. Scaling Recommendations

### WebSocket Server
- **Challenge**: Stateful connections (sticky sessions required).
- **Solution**:
    - Use **Google Cloud Run** with Session Affinity enabled.
    - Implement **Redis Adapter** (`@socket.io/redis-adapter`) to broadcast events across multiple server instances.

### WebRTC (Voice)
- **Current**: Mesh Topology (P2P).
    - **Limit**: ~4-6 users per room before bandwidth/CPU becomes a bottleneck.
- **Scaling**:
    - **SFU (Selective Forwarding Unit)**: Deploy **Mediasoup** or **Jitsi** to handle larger rooms (10-100+ users). The SFU receives one stream from a user and forwards it to others, reducing client bandwidth.
    - **TURN Servers**: Deploy a fleet of TURN servers (e.g., **Coturn**) behind a Load Balancer to handle NAT traversal for restrictive networks.

## 3. Security Audit

### Implemented Fixes
- **Rate Limiting**: Added to `chat:message` event. Limit: 5 messages per 10 seconds per socket.
- **Input Sanitization**: Basic HTML escaping applied to chat messages to prevent XSS.

### Further Recommendations
- **Authentication**: Enforce JWT validation on WebSocket connection handshake.
- **DDoS Protection**: Use Cloud Armor or similar WAF in front of the load balancer.
- **Data Validation**: Use a schema validator (like `zod`) for all incoming socket payloads.
