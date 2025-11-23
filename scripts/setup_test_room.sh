#!/bin/bash
API_URL="https://voice-chat-backend-758892876672.asia-south1.run.app"
TIMESTAMP=$(date +%s)
EMAIL="host_${TIMESTAMP}@test.com"
PASSWORD="password"

# Signup
echo "Signing up..."
curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"test-host\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

# Login
echo "Logging in..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RES | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
USERNAME=$(echo $LOGIN_RES | grep -o '"username":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo "UserId: $USER_ID"
echo "Username: $USERNAME"
echo "UserJSON: {\"id\":\"$USER_ID\",\"username\":\"$USERNAME\",\"email\":\"$EMAIL\"}"

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 1
fi

# Create Room
echo "Creating room..."
ROOM_RES=$(curl -s -X POST "$API_URL/rooms" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Verification Room $TIMESTAMP\",\"topic\":\"Testing\",\"language\":\"English\",\"hostId\":\"$USER_ID\"}")

ROOM_ID=$(echo $ROOM_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "ROOM_ID=$ROOM_ID"
