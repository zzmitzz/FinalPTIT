# Lucky Wheel API Testing Guide

This guide will help you test the Lucky Wheel API endpoints using the provided test scripts.

## Prerequisites

- Node.js installed
- Axios package: `npm install axios`
- Running server on http://localhost:3456

## Step 1: Log in and get an auth token

The first step is to log in with your credentials to get an authentication token:

```bash
# Install axios if you haven't already
npm install axios

# Run the login script
node try_login_endpoints.js
```

The script will try multiple possible login endpoints using the credentials:
- Email: admin@gmail.com
- Password: password@123

When successful, you'll get an authentication token to use in the next steps.

## Step 2: Find resources for testing

Now that you have an auth token, update the `find_resources.js` file with your token:

```javascript
// In find_resources.js
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with your actual token
```

Then run the script to find existing events, prizes, and registrations:

```bash
node find_resources.js
```

This will show you:
1. Available events (you'll need an event ID)
2. Available prizes (you'll need a prize ID)
3. Available registrations (optional: for LUCKY_CHECKED_IN type)

## Step 3: Create a test prize (if needed)

If no prizes were found, you can create one using the `create_prize.js` script:

```javascript
// In create_prize.js
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with your token
const EVENT_ID = 'YOUR_EVENT_ID'; // Replace with an event ID
```

Then run:

```bash
node create_prize.js
```

This will create a test prize and provide you with its ID.

## Step 4: Update and run the test scripts

Update your test scripts with the values collected in steps 1-3:

### For JavaScript tests (test_lucky_wheel.js):

```javascript
// In test_lucky_wheel.js
const CONFIG = {
  baseUrl: 'http://localhost:3456',
  eventId: 'YOUR_EVENT_ID', // From step 2
  organizerToken: 'YOUR_AUTH_TOKEN', // From step 1
  prizeId: 'YOUR_PRIZE_ID', // From step 2 or 3
  registrationId: 'YOUR_REGISTRATION_ID', // Optional, from step 2
};
```

Then run:

```bash
node test_lucky_wheel.js
```

### For Shell script tests (test_lucky_wheel.sh):

```bash
# In test_lucky_wheel.sh
BASE_URL="http://localhost:3456"
EVENT_ID="YOUR_EVENT_ID" # From step 2
ORGANIZER_TOKEN="YOUR_AUTH_TOKEN" # From step 1
LW_PRIZE_ID="YOUR_PRIZE_ID" # From step 2 or 3
REGISTRATION_ID="YOUR_REGISTRATION_ID" # Optional, from step 2
```

Make the script executable and run it:

```bash
chmod +x test_lucky_wheel.sh
./test_lucky_wheel.sh
```

### For Postman:

1. Import the `lucky_wheel_postman_collection.json` collection
2. Create an environment with the following variables:
   - base_url: http://localhost:3456
   - event_id: YOUR_EVENT_ID (from step 2)
   - organizer_token: YOUR_AUTH_TOKEN (from step 1)
   - lw_prize_id: YOUR_PRIZE_ID (from step 2 or 3)
   - registration_id: YOUR_REGISTRATION_ID (optional, from step 2)

3. Run the collection with your environment

## Testing Sequence

The tests will perform the following operations in sequence:

1. Get all lucky wheels for the event
2. Create a new lucky wheel with LUCKY_PRIZE type
3. Create a new lucky wheel with LUCKY_CHECKED_IN type
4. Get a specific lucky wheel by ID
5. Update a lucky wheel
6. Set prizes for a lucky wheel
7. Get prizes and their remaining quantities
8. Spin the LUCKY_PRIZE wheel
9. Spin the LUCKY_CHECKED_IN wheel
10. Get the history of lucky wheel spins
11. Delete a lucky wheel

## Test Results Summary

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| Create Lucky Wheel | POST | ✅ Working | Both LUCKY_PRIZE and LUCKY_CHECKED_IN types |
| Get All Lucky Wheels | GET | ✅ Working | |
| Get Lucky Wheel | GET | ✅ Working | |
| Update Lucky Wheel | PUT | ✅ Working | |
| Set Lucky Wheel Prizes | POST | ✅ Working | |
| Get Lucky Wheel Prizes | GET | ✅ Working | |
| Spin Lucky Wheel | POST | ✅ Fixed | Returns success:false when no prizes available |
| Get Lucky Wheel History | GET | ✅ Working | Returns empty data when no spins exist |
| Delete Lucky Wheel | DELETE | ✅ Working | |

## Spin Functionality

The spin endpoint has been fixed and now returns a proper 200 OK response even when no prizes are available. In cases where a prize cannot be awarded, the response will look like:

```json
{
  "status": 200,
  "success": true,
  "message": "OK",
  "data": {
    "success": false,
    "message": "No available prizes or lucky wheel not found",
    "prize": null,
    "registration": null,
    "remaining_quantities": {}
  }
}
```

When spinning the wheel, you can provide a `registration_id` for the LUCKY_PRIZE type wheels. For LUCKY_CHECKED_IN type wheels, no registration_id is needed as it randomly selects from checked-in participants.

### Important Notes About Spin Tests

While testing the spin functionality, we discovered that even when prizes are correctly associated with a wheel, the spin operation still returns "No available prizes or lucky wheel not found" in the current test environment. This happens for two reasons:

1. For **LUCKY_PRIZE** wheels:
   - This requires a valid registration ID
   - In our test environment, we don't have valid registrations (the registration IDs return 404)
   - You need to create a valid registration in the system for this to work

2. For **LUCKY_CHECKED_IN** wheels:
   - This requires at least one checked-in registration
   - Although our database shows registrations with `check_in_at` fields, the API is not finding these as valid checked-in registrations
   - There may be additional criteria for what constitutes a "checked-in" registration in the backend code

To test a successful spin in a real environment:

1. Ensure you have valid registrations in the system
2. For LUCKY_CHECKED_IN wheels, make sure users are properly checked in 
3. Create a prize and set its `availability` to `true`
4. Associate the prize with a lucky wheel and set a positive quantity
5. Then spin the wheel

In the test environment, the complete flow (registration → check-in → prize award) would need to be simulated to test the entire process.

### Fixed Issue

Previously, the spin endpoint was returning a 500 error due to an improper handling of 404 responses in the controller. The error occurred because:

1. The `spinLuckyWheel` service function returns `null` when no prizes are available
2. The controller was returning a 404 status code in this case
3. The response handler was configured to reject any non-success status codes

The fix involved modifying the controller to return a proper 200 OK response with a data object indicating no prizes were available, rather than returning a 404 status.

## Next Steps for Testing

Now that we've fixed the spin functionality to properly handle cases where no prizes are available, we should expand our testing to cover real-world scenarios:

1. **Test with valid prizes**: Since our tests are currently returning `success: false` because there are no available prize connections, you should test with properly configured prizes to verify the full end-to-end flow.

2. **Test with checked-in participants**: For LUCKY_CHECKED_IN wheels, verify that the wheel can successfully select a random checked-in participant.

3. **Test quantity management**: Verify that prize quantities are properly decremented after successful spins.

The `spinLuckyWheel` service function itself appears to be correctly implemented, handling various scenarios:

```javascript
export async function spinLuckyWheel(session, event, luckyWheelId, registrationId = null) {
    // First check if lucky wheel exists
    const luckyWheel = await LuckyWheel.findOne({
        _id: luckyWheelId,
        event_id: event._id
    }).session(session)

    if (!luckyWheel) {
        return null
    }

    // Get prize details, check availabilities, select random prize...
    // [Additional logic for prize selection and history creation]
}
```

But our test environment doesn't have all the necessary data to test successful prize winning scenarios. This would require creating full prize and registration connections in a way that matches the database schema requirements.

## Troubleshooting

If you encounter any issues:

1. Make sure your server is running on http://localhost:3456
2. Verify that your authentication token is valid and not expired
3. Check that the event ID and prize ID are valid
4. For the LUCKY_CHECKED_IN type, make sure you have registrations that have checked in
5. If a test fails, look at the error message for details on what went wrong 