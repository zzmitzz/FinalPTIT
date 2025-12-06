# API CURL Commands Documentation

> **Base URL**: `http://localhost:3000` (adjust port as needed)
> 
> **Note**: Replace `YOUR_TOKEN_HERE` with actual JWT tokens obtained from login/register endpoints.

---

## Table of Contents

1. [Registration Routes](#registration-routes)
   - [Authentication](#1-registration-authentication)
   - [Event Registration](#2-event-registration)
   - [Registration Responses](#3-registration-responses)
   - [Session Registration](#4-session-registration)
   - [Events (Registration View)](#5-events-registration-view)
2. [Organizer Routes](#organizer-routes)
   - [Authentication](#1-organizer-authentication)
   - [Events Management](#2-events-management)
   - [Forms Management](#3-forms-management)
   - [Form Fields Management](#4-form-fields-management)

---

# Registration Routes

## 1. Registration Authentication

### Register a New Registration User
```bash
curl -X POST http://localhost:3000/registrations/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "phone": "+84123456789"
  }'
```

### Login as Registration User
```bash
curl -X POST http://localhost:3000/registrations/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current Registration User Profile
```bash
curl -X GET http://localhost:3000/registrations/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Registration User Profile
```bash
# With JSON
curl -X PUT http://localhost:3000/registrations/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "phone": "+84987654321",
    "dob": "1990-01-15",
    "gender": "male",
    "address": "123 Main St, Hanoi",
    "bio": "Event enthusiast"
  }'

# With file upload (multipart/form-data)
curl -X PUT http://localhost:3000/registrations/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "full_name=John Doe" \
  -F "phone=+84987654321" \
  -F "dob=1990-01-15" \
  -F "gender=male" \
  -F "address=123 Main St, Hanoi" \
  -F "bio=Event enthusiast" \
  -F "avatar=@/path/to/avatar.jpg"
```

### Change Password
```bash
curl -X PATCH http://localhost:3000/registrations/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "OldPassword123!",
    "new_password": "NewPassword456!"
  }'
```

### Forgot Password
```bash
curl -X POST http://localhost:3000/registrations/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Reset Password with Token
```bash
curl -X POST http://localhost:3000/registrations/auth/reset-password/RESET_TOKEN_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "NewPassword789!"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/registrations/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2. Event Registration

### Get All Registered Events
```bash
curl -X GET http://localhost:3000/registrations/registered-events/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Registered Events by Month
```bash
curl -X GET "http://localhost:3000/registrations/registered-events/by-month?month=11&year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. Registration Responses

### Create a Single Registration Response
```bash
curl -X POST http://localhost:3000/registrations/responses/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "123e4567-e89b-12d3-a456-426614174000",
    "form_fields_id": "123e4567-e89b-12d3-a456-426614174001",
    "response": "John Doe"
  }'
```

### Get List of Registration Responses
```bash
# Basic list
curl -X GET http://localhost:3000/registrations/responses/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With pagination and filters
curl -X GET "http://localhost:3000/registrations/responses/?page=1&limit=20&event_id=EVENT_ID&form_fields_id=FIELD_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Submit Form Responses (Bulk Create)
```bash
curl -X POST http://localhost:3000/registrations/responses/submit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "123e4567-e89b-12d3-a456-426614174000",
    "responses": [
      {
        "form_fields_id": "123e4567-e89b-12d3-a456-426614174001",
        "response": "John Doe"
      },
      {
        "form_fields_id": "123e4567-e89b-12d3-a456-426614174002",
        "response": "john@example.com"
      },
      {
        "form_fields_id": "123e4567-e89b-12d3-a456-426614174003",
        "response": "+84123456789"
      }
    ]
  }'
```

### Get Registration Response by ID
```bash
curl -X GET http://localhost:3000/registrations/responses/RESPONSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Registration Response
```bash
curl -X PUT http://localhost:3000/registrations/responses/RESPONSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "123e4567-e89b-12d3-a456-426614174000",
    "form_fields_id": "123e4567-e89b-12d3-a456-426614174001",
    "response": "Jane Doe"
  }'
```

---

## 4. Session Registration

### Register for a Session
```bash
curl -X POST http://localhost:3000/registrations/session-registrations/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 123
  }'
```

### Check In to a Session
```bash
curl -X POST http://localhost:3000/registrations/session-registrations/check-in \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 123
  }'
```

### Cancel Session Registration
```bash
curl -X POST http://localhost:3000/registrations/session-registrations/cancel \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 123,
    "cancellation_reason": "Schedule conflict"
  }'
```

### Get All Session Registrations
```bash
# All registrations
curl -X GET http://localhost:3000/registrations/session-registrations/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With filters
curl -X GET "http://localhost:3000/registrations/session-registrations/?status=attending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Specific Session Registration
```bash
curl -X GET http://localhost:3000/registrations/session-registrations/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Sessions by Event
```bash
curl -X GET http://localhost:3000/registrations/session-registrations/event/EVENT_ID/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 5. Events (Registration View)

### List All Events
```bash
curl -X GET http://localhost:3000/registrations/events/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Events
```bash
curl -X GET "http://localhost:3000/registrations/events/search?q=tech%20conference" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Nearby Events
```bash
curl -X GET "http://localhost:3000/registrations/events/nearby?lat=21.0285&lng=105.8542" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Event by PIN Code
```bash
curl -X GET http://localhost:3000/registrations/events/pin/123456 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Event by ID
```bash
curl -X GET http://localhost:3000/registrations/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Register for an Event
```bash
curl -X GET http://localhost:3000/registrations/events/EVENT_ID/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

# Organizer Routes

## 1. Organizer Authentication

### Register a New Organizer
```bash
curl -X POST http://localhost:3000/organizer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "SecurePass123!",
    "name": "Event Organizer Co.",
    "phone": "+84123456789"
  }'
```

### Login as Organizer
```bash
curl -X POST http://localhost:3000/organizer/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current Organizer Profile
```bash
curl -X GET http://localhost:3000/organizer/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Organizer Profile
```bash
# With JSON
curl -X PUT http://localhost:3000/organizer/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Organizer Name",
    "email": "newemail@example.com",
    "phone": "+84987654321"
  }'

# With file upload (multipart/form-data)
curl -X PUT http://localhost:3000/organizer/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name=Updated Organizer Name" \
  -F "email=newemail@example.com" \
  -F "phone=+84987654321" \
  -F "avatar=@/path/to/avatar.jpg"
```

### Change Organizer Password
```bash
curl -X PATCH http://localhost:3000/organizer/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "NewPassword456!"
  }'
```

---

## 2. Events Management

### Create a New Event
```bash
curl -X POST http://localhost:3000/organizer/events/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name=Tech Conference 2025" \
  -F "description=Annual technology conference" \
  -F "start_time=2025-12-01T09:00:00Z" \
  -F "end_time=2025-12-01T18:00:00Z" \
  -F "location=Hanoi Convention Center" \
  -F "lat=21.0285" \
  -F "lng=105.8542" \
  -F "capacity=500" \
  -F "category_id=CATEGORY_ID" \
  -F "tags=technology" \
  -F "tags=conference" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "logo=@/path/to/logo1.png" \
  -F "logo=@/path/to/logo2.png"
```

### List Events with Pagination
```bash
curl -X GET "http://localhost:3000/organizer/events/?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Events
```bash
curl -X GET "http://localhost:3000/organizer/events/search?q=conference&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Organizer's Events Grouped by Date
```bash
curl -X GET http://localhost:3000/organizer/events/my-events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Nearby Events
```bash
curl -X GET "http://localhost:3000/organizer/events/nearby?lat=21.0285&lng=105.8542&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Event by PIN Code
```bash
curl -X GET http://localhost:3000/organizer/events/pin/123456 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Event by ID
```bash
curl -X GET http://localhost:3000/organizer/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Event Registrations
```bash
curl -X GET http://localhost:3000/organizer/events/EVENT_ID/registrations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Event Sessions
```bash
curl -X GET http://localhost:3000/organizer/events/EVENT_ID/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Event Statistics
```bash
curl -X GET http://localhost:3000/organizer/events/EVENT_ID/statistics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update an Event
```bash
curl -X PUT http://localhost:3000/organizer/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Event Name",
    "description": "Updated description",
    "start_time": "2025-12-15T09:00:00Z",
    "end_time": "2025-12-15T18:00:00Z",
    "location": "New Location",
    "capacity": 600,
    "status": "active",
    "pin_code": "654321"
  }'
```

### Delete an Event
```bash
curl -X DELETE http://localhost:3000/organizer/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. Forms Management

### Create a Form with Fields
```bash
curl -X POST http://localhost:3000/organizer/events/forms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "EVENT_ID",
    "title": "Registration Form",
    "description": "Please fill out this form to register",
    "is_public": true,
    "fields": [
      {
        "field_label": "Full Name",
        "field_description": "Enter your full name",
        "field_type": "TEXT",
        "required": true,
        "is_primary_key": true,
        "can_edit": false,
        "position": 0
      },
      {
        "field_label": "Email Address",
        "field_type": "EMAIL",
        "required": true,
        "position": 1
      },
      {
        "field_label": "Phone Number",
        "field_type": "PHONE",
        "required": true,
        "position": 2
      },
      {
        "field_label": "T-Shirt Size",
        "field_type": "RADIO",
        "field_options": ["S", "M", "L", "XL"],
        "field_has_other_option": false,
        "required": true,
        "position": 3
      },
      {
        "field_label": "Dietary Restrictions",
        "field_type": "CHECKBOX",
        "field_options": ["Vegetarian", "Vegan", "Gluten-free", "Halal"],
        "field_has_other_option": true,
        "required": false,
        "position": 4
      },
      {
        "field_label": "Age",
        "field_type": "NUMBER",
        "field_range": {
          "min": 18,
          "max": 100
        },
        "required": true,
        "position": 5
      },
      {
        "field_label": "Resume",
        "field_type": "FILE",
        "field_extensions": ["pdf", "doc", "docx"],
        "required": false,
        "position": 6
      }
    ]
  }'
```

### Get Form by ID
```bash
curl -X GET http://localhost:3000/organizer/events/forms/FORM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update a Form
```bash
curl -X PUT http://localhost:3000/organizer/events/forms/FORM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Registration Form",
    "description": "Updated description",
    "is_public": false
  }'
```

### Delete a Form
```bash
curl -X DELETE http://localhost:3000/organizer/events/forms/FORM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 4. Form Fields Management

### Get Form Field by ID
```bash
curl -X GET http://localhost:3000/organizer/events/form-fields/FIELD_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update a Form Field
```bash
curl -X PUT http://localhost:3000/organizer/events/form-fields/FIELD_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "field_label": "Updated Field Label",
    "field_description": "Updated description",
    "field_type": "TEXT",
    "required": true,
    "position": 0
  }'
```

### Delete a Form Field
```bash
curl -X DELETE http://localhost:3000/organizer/events/form-fields/FIELD_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes

### Field Types Available
- `EMAIL` - Email address
- `PHONE` - Phone number
- `FILE` - File upload
- `FACE_ID` - Face ID verification
- `RADIO` - Radio button (single choice)
- `CHECKBOX` - Checkbox (multiple choice)
- `TEXT` - Single line text
- `TEXTAREA` - Multi-line text
- `NUMBER` - Numeric input
- `DATE` - Date picker
- `TIME_MINUTE` - Time picker

### Session Registration Status Values
- `attending` - User is registered and attending
- `waitlist` - User is on waitlist
- `cancelled` - Registration cancelled
- `checked_in` - User has checked in
- `no_show` - User didn't show up

### Gender Values
- `male`
- `female`
- `other`

### Tips for Testing

1. **Get your token first**: Always start by registering or logging in to get a JWT token
2. **Replace placeholders**: Replace `YOUR_TOKEN_HERE`, `EVENT_ID`, `FORM_ID`, etc. with actual values
3. **Adjust the base URL**: Change `http://localhost:3000` to match your server configuration
4. **File uploads**: When using `-F` flag for file uploads, ensure the file path is correct
5. **URL encoding**: Special characters in query parameters should be URL encoded (e.g., space = `%20`)

### Example Workflow

```bash
# 1. Register as organizer
curl -X POST http://localhost:3000/organizer/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"org@test.com","password":"Pass123!","name":"Test Org","phone":"+84123456789"}'

# 2. Save the token from response, then create an event
curl -X POST http://localhost:3000/organizer/events/ \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "name=My Event" \
  -F "start_time=2025-12-01T09:00:00Z" \
  -F "end_time=2025-12-01T18:00:00Z" \
  -F "location=Hanoi" \
  -F "lat=21.0285" \
  -F "lng=105.8542" \
  -F "capacity=100" \
  -F "thumbnail=@./event.jpg"

# 3. Register as a user
curl -X POST http://localhost:3000/registrations/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!","phone":"+84987654321"}'

# 4. Browse events as user
curl -X GET http://localhost:3000/registrations/events/ \
  -H "Authorization: Bearer eyJhbGc..."
```
