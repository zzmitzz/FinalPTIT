# Speaker API Routes - Registration Context

This document provides curl examples and expected responses for the speaker-related endpoints in the registration context.

## Base URL
```
http://localhost:3456/registrations/events
```

## Authentication
All endpoints require registration authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_registration_token>
```

---

## 1. Get Speaker by ID

### Endpoint
```
GET /registrations/events/speakers/:id
```

### Description
Retrieves all properties of a speaker by their ID.

### Parameters
- `id` (path parameter, required): The speaker ID (integer)

### Example Request
```bash
curl -X GET \
  http://localhost:3456/registrations/events/speakers/1 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Success Response (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": 1,
    "full_name": "Dr. John Smith",
    "bio": "Dr. John Smith is a renowned expert in artificial intelligence with over 15 years of experience in machine learning and deep learning.",
    "email": "john.smith@example.com",
    "phone": "+1-555-0123",
    "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
    "photo_url": "http://localhost:3456/static/uploads/speakers/john-smith.jpg",
    "professional_title": "Chief AI Scientist",
    "linkedin_url": "https://linkedin.com/in/johnsmith",
    "created_at": "2025-12-01T10:30:00.000Z",
    "updated_at": "2025-12-05T14:20:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request (Invalid ID)
```json
{
  "status": 400,
  "success": false,
  "message": "ID diễn giả không hợp lệ."
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy diễn giả."
}
```

#### 401 Unauthorized
```json
{
  "status": 401,
  "success": false,
  "message": "Unauthorized - Token missing or invalid"
}
```

---

## 2. Get All Sessions by Speaker ID

### Endpoint
```
GET /registrations/events/speakers/:id/sessions
```

### Description
Retrieves all sessions that belong to a specific speaker, including their role and speaking details in each session.

### Parameters
- `id` (path parameter, required): The speaker ID (integer)

### Example Request
```bash
curl -X GET \
  http://localhost:3456/registrations/events/speakers/1/sessions \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Success Response (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "speaker": {
      "id": 1,
      "full_name": "Dr. John Smith",
      "bio": "Dr. John Smith is a renowned expert in artificial intelligence with over 15 years of experience in machine learning and deep learning.",
      "email": "john.smith@example.com",
      "phone": "+1-555-0123",
      "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
      "photo_url": "http://localhost:3456/static/uploads/speakers/john-smith.jpg",
      "professional_title": "Chief AI Scientist",
      "linkedin_url": "https://linkedin.com/in/johnsmith",
      "created_at": "2025-12-01T10:30:00.000Z",
      "updated_at": "2025-12-05T14:20:00.000Z"
    },
    "sessions": [
      {
        "id": 101,
        "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
        "title": "Introduction to Machine Learning",
        "description": "A comprehensive introduction to machine learning concepts and applications.",
        "start_time": "2025-12-15T09:00:00.000Z",
        "end_time": "2025-12-15T10:30:00.000Z",
        "place": "Main Hall A",
        "capacity": 200,
        "is_active": true,
        "session_type": "keynote",
        "tags": ["AI", "Machine Learning", "Technology"],
        "created_at": "2025-12-01T11:00:00.000Z",
        "updated_at": "2025-12-05T15:00:00.000Z",
        "speaker_role": "main_speaker",
        "speaking_order": 1,
        "speaking_duration_minutes": 60
      },
      {
        "id": 105,
        "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
        "title": "Deep Learning Workshop",
        "description": "Hands-on workshop on deep learning frameworks and neural networks.",
        "start_time": "2025-12-15T14:00:00.000Z",
        "end_time": "2025-12-15T16:00:00.000Z",
        "place": "Workshop Room 3",
        "capacity": 50,
        "is_active": true,
        "session_type": "workshop",
        "tags": ["Deep Learning", "Neural Networks", "Hands-on"],
        "created_at": "2025-12-01T11:15:00.000Z",
        "updated_at": "2025-12-05T15:10:00.000Z",
        "speaker_role": "co_speaker",
        "speaking_order": 2,
        "speaking_duration_minutes": 45
      }
    ],
    "total": 2
  }
}
```

### Success Response - No Sessions (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "speaker": {
      "id": 2,
      "full_name": "Jane Doe",
      "bio": "Software engineer and tech enthusiast.",
      "email": "jane.doe@example.com",
      "phone": "+1-555-0456",
      "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
      "photo_url": "http://localhost:3456/static/uploads/speakers/jane-doe.jpg",
      "professional_title": "Senior Software Engineer",
      "linkedin_url": "https://linkedin.com/in/janedoe",
      "created_at": "2025-12-02T10:30:00.000Z",
      "updated_at": "2025-12-05T14:20:00.000Z"
    },
    "sessions": [],
    "total": 0
  }
}
```

### Error Responses

#### 400 Bad Request (Invalid ID)
```json
{
  "status": 400,
  "success": false,
  "message": "ID diễn giả không hợp lệ."
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy diễn giả."
}
```

#### 401 Unauthorized
```json
{
  "status": 401,
  "success": false,
  "message": "Unauthorized - Token missing or invalid"
}
```

#### 500 Internal Server Error
```json
{
  "status": 500,
  "success": false,
  "message": "Đã xảy ra lỗi khi lấy danh sách phiên của diễn giả.",
  "error": "Database connection failed"
}
```

---

## Notes

### Session Speaker Roles
The `speaker_role` field can have the following values:
- `main_speaker`: Primary speaker for the session
- `co_speaker`: Co-presenter
- `panelist`: Panel discussion participant
- `moderator`: Session moderator
- `speaker`: Default role

### Session Types
The `session_type` field can include:
- `keynote`: Keynote presentation
- `workshop`: Hands-on workshop
- `panel`: Panel discussion
- `networking`: Networking session
- `general`: General session

### Additional Fields
- `speaking_order`: The order in which the speaker will present (1, 2, 3, etc.)
- `speaking_duration_minutes`: Allocated speaking time in minutes
- `tags`: Array of searchable tags for categorizing sessions

### Authentication Token
To get a registration authentication token, you need to:
1. Register as a user via `/registrations/auth/register`
2. Login via `/registrations/auth/login`
3. Use the returned JWT token in the Authorization header
