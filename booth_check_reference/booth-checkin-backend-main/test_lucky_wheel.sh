#!/bin/bash

# Set variables for testing
BASE_URL="http://localhost:3456"
EVENT_ID="YOUR_EVENT_ID" # Replace with a valid event ID
ORGANIZER_TOKEN="YOUR_AUTH_TOKEN" # Replace with a valid organizer token
LW_PRIZE_ID="YOUR_PRIZE_ID" # Replace with a valid prize ID
REGISTRATION_ID="YOUR_REGISTRATION_ID" # Optional: for testing with a specific registration

# Create a function to print curl responses in a more readable way
print_response() {
  local title=$1
  local response=$2
  echo "===== $title ====="
  echo "$response" | python -m json.tool
  echo ""
}

# 1. Get all lucky wheels for an event
echo "1. Testing: GET all lucky wheels for an event"
response=$(curl -s -X GET \
  "$BASE_URL/events/$EVENT_ID/lucky-wheels" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN")
print_response "GET all lucky wheels" "$response"

# 2. Create a new lucky wheel (LUCKY_PRIZE type)
echo "2. Testing: CREATE a new lucky wheel (LUCKY_PRIZE type)"
response=$(curl -s -X POST \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lucky Wheel - Prize Only",
    "type": "LUCKY_PRIZE"
  }')
print_response "CREATE lucky wheel (LUCKY_PRIZE)" "$response"

# Extract the lucky wheel ID for LUCKY_PRIZE type
LW_ID_PRIZE=$(echo $response | python -c "import sys, json; print(json.load(sys.stdin).get('_id', ''))")
echo "Created lucky wheel ID (LUCKY_PRIZE): $LW_ID_PRIZE"

# 3. Create a new lucky wheel (LUCKY_CHECKED_IN type)
echo "3. Testing: CREATE a new lucky wheel (LUCKY_CHECKED_IN type)"
response=$(curl -s -X POST \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lucky Wheel - Checked In",
    "type": "LUCKY_CHECKED_IN"
  }')
print_response "CREATE lucky wheel (LUCKY_CHECKED_IN)" "$response"

# Extract the lucky wheel ID for LUCKY_CHECKED_IN type
LW_ID_CHECKED=$(echo $response | python -c "import sys, json; print(json.load(sys.stdin).get('_id', ''))")
echo "Created lucky wheel ID (LUCKY_CHECKED_IN): $LW_ID_CHECKED"

# 4. Get a specific lucky wheel
echo "4. Testing: GET a specific lucky wheel"
response=$(curl -s -X GET \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_PRIZE" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN")
print_response "GET specific lucky wheel" "$response"

# 5. Update a lucky wheel
echo "5. Testing: UPDATE a lucky wheel"
response=$(curl -s -X PUT \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_PRIZE" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Lucky Wheel",
    "type": "LUCKY_PRIZE"
  }')
print_response "UPDATE lucky wheel" "$response"

# 6. Set prizes for a lucky wheel
echo "6. Testing: SET prizes for a lucky wheel"
response=$(curl -s -X POST \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_PRIZE/prizes" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prizes": [
      {
        "prize_id": "'$LW_PRIZE_ID'",
        "quantity": 10
      }
    ]
  }')
print_response "SET prizes for lucky wheel" "$response"

# 7. Get prizes for a lucky wheel
echo "7. Testing: GET prizes for a lucky wheel"
response=$(curl -s -X GET \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_PRIZE/prizes" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN")
print_response "GET prizes for lucky wheel" "$response"

# 8. Spin the LUCKY_PRIZE wheel
echo "8. Testing: SPIN the LUCKY_PRIZE wheel"
response=$(curl -s -X POST \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_PRIZE/spin" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_id": "'$REGISTRATION_ID'"
  }')
print_response "SPIN lucky wheel (LUCKY_PRIZE)" "$response"

# 9. Spin the LUCKY_CHECKED_IN wheel
echo "9. Testing: SPIN the LUCKY_CHECKED_IN wheel"
response=$(curl -s -X POST \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_CHECKED/spin" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
print_response "SPIN lucky wheel (LUCKY_CHECKED_IN)" "$response"

# 10. Get history of lucky wheel spins
echo "10. Testing: GET history of lucky wheel spins"
response=$(curl -s -X GET \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_PRIZE/history" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN")
print_response "GET history of lucky wheel spins" "$response"

# 11. Delete a lucky wheel
echo "11. Testing: DELETE a lucky wheel"
response=$(curl -s -X DELETE \
  "$BASE_URL/events/$EVENT_ID/lucky-wheel/$LW_ID_PRIZE" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN")
print_response "DELETE lucky wheel" "$response"

echo "All tests completed!" 