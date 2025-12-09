# Resource API Routes - Registration Context

This document provides curl examples and expected responses for the resource-related endpoints in the registration context.

## Base URL
```
http://localhost:3456/registrations/resources
```

## Authentication
All endpoints require registration authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_registration_token>
```

## Resource Types
- `FILE`: Uploaded file resources (PDFs, images, documents, etc.)
- `MAPS`: URL-based resources (Google Maps links, external URLs, etc.)

---

## 1. Create Resource - FILE Type

### Endpoint
```
POST /registrations/resources
```

### Description
Creates a new file resource for an event or session. The user must be registered for the event/session.

### Parameters
- `event_id` (optional): Event UUID (required if session_id not provided)
- `session_id` (optional): Session ID (required if event_id not provided)
- `resource_type`: Type of resource (`FILE` or `MAPS`)
- `name`: Resource name (must be unique within event/session)
- `file`: File to upload (required for FILE type, max 50MB)
- `description` (optional): Resource description
- `is_public` (optional): Whether resource is publicly accessible (default: true)
- `is_active` (optional): Whether resource is active (default: true)
- `tags` (optional): Array of tags for categorization

### Example Request - Event Resource
```bash
curl -X POST \
  http://localhost:3456/registrations/resources \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: multipart/form-data' \
  -F 'event_id=bf883a2e-a119-49dd-85a6-a81192a6898c' \
  -F 'resource_type=FILE' \
  -F 'name=Event Schedule PDF' \
  -F 'file=@/path/to/schedule.pdf' \
  -F 'description=Complete event schedule with all sessions and speakers' \
  -F 'is_public=true' \
  -F 'is_active=true' \
  -F 'tags=["schedule", "pdf", "important"]'
```

### Example Request - Session Resource
```bash
curl -X POST \
  http://localhost:3456/registrations/resources \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: multipart/form-data' \
  -F 'session_id=101' \
  -F 'resource_type=FILE' \
  -F 'name=Workshop Materials' \
  -F 'file=@/path/to/materials.pdf' \
  -F 'description=Workshop slides and exercises' \
  -F 'tags=["workshop", "materials"]'
```

### Success Response (201 Created)
```json
{
  "status": 201,
  "success": true,
  "message": "Tạo tài nguyên thành công.",
  "data": {
    "id": 1,
    "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
    "session_id": null,
    "resource_type": "FILE",
    "name": "Event Schedule PDF",
    "url_source": "http://localhost:3456/static/uploads/resources/schedule-1733765891234.pdf",
    "description": "Complete event schedule with all sessions and speakers",
    "file_size_bytes": 2458624,
    "mime_type": "application/pdf",
    "is_public": true,
    "is_active": true,
    "download_count": 0,
    "tags": ["schedule", "pdf", "important"],
    "upload_date": "2025-12-09T16:34:51.234Z",
    "created_at": "2025-12-09T16:34:51.234Z",
    "updated_at": "2025-12-09T16:34:51.234Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "status": 400,
  "success": false,
  "message": "Phải cung cấp event_id hoặc session_id."
}
```

#### 400 Bad Request - File Too Large
```json
{
  "status": 400,
  "success": false,
  "message": "Tệp tải lên không được vượt quá 50MB."
}
```

#### 400 Bad Request - Duplicate Name
```json
{
  "status": 400,
  "success": false,
  "message": "Tên tài nguyên đã tồn tại trong sự kiện/phiên này."
}
```

#### 403 Forbidden - Not Registered
```json
{
  "status": 403,
  "success": false,
  "message": "Bạn không có quyền tạo tài nguyên cho sự kiện này."
}
```

#### 404 Not Found - Event Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy sự kiện."
}
```

---

## 2. Create Resource - MAPS Type

### Endpoint
```
POST /registrations/resources
```

### Description
Creates a new URL-based resource (e.g., Google Maps link, external documentation).

### Example Request
```bash
curl -X POST \
  http://localhost:3456/registrations/resources \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
    "resource_type": "MAPS",
    "name": "Event Venue Location",
    "url_source": "https://maps.google.com/?q=Convention+Center",
    "description": "Google Maps link to the event venue",
    "is_public": true,
    "is_active": true,
    "tags": ["location", "venue", "maps"]
  }'
```

### Success Response (201 Created)
```json
{
  "status": 201,
  "success": true,
  "message": "Tạo tài nguyên thành công.",
  "data": {
    "id": 2,
    "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
    "session_id": null,
    "resource_type": "MAPS",
    "name": "Event Venue Location",
    "url_source": "https://maps.google.com/?q=Convention+Center",
    "description": "Google Maps link to the event venue",
    "file_size_bytes": null,
    "mime_type": null,
    "is_public": true,
    "is_active": true,
    "download_count": 0,
    "tags": ["location", "venue", "maps"],
    "upload_date": "2025-12-09T16:35:00.000Z",
    "created_at": "2025-12-09T16:35:00.000Z",
    "updated_at": "2025-12-09T16:35:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing URL
```json
{
  "status": 400,
  "success": false,
  "message": "URL nguồn là bắt buộc cho loại MAPS."
}
```

---

## 3. Get Resource by ID

### Endpoint
```
GET /registrations/resources/:id
```

### Description
Retrieves a specific resource by its ID. User must be registered for the associated event/session.

### Parameters
- `id` (path parameter, required): The resource ID (integer)

### Example Request
```bash
curl -X GET \
  http://localhost:3456/registrations/resources/1 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Success Response (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": 1,
    "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
    "session_id": null,
    "resource_type": "FILE",
    "name": "Event Schedule PDF",
    "url_source": "http://localhost:3456/static/uploads/resources/schedule-1733765891234.pdf",
    "description": "Complete event schedule with all sessions and speakers",
    "file_size_bytes": 2458624,
    "mime_type": "application/pdf",
    "is_public": true,
    "is_active": true,
    "download_count": 5,
    "tags": ["schedule", "pdf", "important"],
    "upload_date": "2025-12-09T16:34:51.234Z",
    "created_at": "2025-12-09T16:34:51.234Z",
    "updated_at": "2025-12-09T16:34:51.234Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid ID
```json
{
  "status": 400,
  "success": false,
  "message": "Resource ID là bắt buộc."
}
```

#### 403 Forbidden - Not Registered
```json
{
  "status": 403,
  "success": false,
  "message": "Bạn không có quyền truy cập tài nguyên này."
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy tài nguyên."
}
```

---

## 4. Get All Resources by Event ID

### Endpoint
```
GET /registrations/resources/event/:eventId
```

### Description
Retrieves all resources associated with a specific event. User must be registered for the event.

### Parameters
- `eventId` (path parameter, required): The event UUID

### Example Request
```bash
curl -X GET \
  http://localhost:3456/registrations/resources/event/bf883a2e-a119-49dd-85a6-a81192a6898c \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Success Response (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
        "session_id": null,
        "resource_type": "FILE",
        "name": "Event Schedule PDF",
        "url_source": "http://localhost:3456/static/uploads/resources/schedule-1733765891234.pdf",
        "description": "Complete event schedule with all sessions and speakers",
        "file_size_bytes": 2458624,
        "mime_type": "application/pdf",
        "is_public": true,
        "is_active": true,
        "download_count": 5,
        "tags": ["schedule", "pdf", "important"],
        "upload_date": "2025-12-09T16:34:51.234Z",
        "created_at": "2025-12-09T16:34:51.234Z",
        "updated_at": "2025-12-09T16:34:51.234Z"
      },
      {
        "id": 2,
        "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
        "session_id": null,
        "resource_type": "MAPS",
        "name": "Event Venue Location",
        "url_source": "https://maps.google.com/?q=Convention+Center",
        "description": "Google Maps link to the event venue",
        "file_size_bytes": null,
        "mime_type": null,
        "is_public": true,
        "is_active": true,
        "download_count": 12,
        "tags": ["location", "venue", "maps"],
        "upload_date": "2025-12-09T16:35:00.000Z",
        "created_at": "2025-12-09T16:35:00.000Z",
        "updated_at": "2025-12-09T16:35:00.000Z"
      }
    ],
    "total": 2
  }
}
```

### Success Response - No Resources (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "data": [],
    "total": 0
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "status": 400,
  "success": false,
  "message": "Event ID là bắt buộc."
}
```

#### 403 Forbidden
```json
{
  "status": 403,
  "success": false,
  "message": "Bạn không có quyền truy cập sự kiện này."
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy sự kiện."
}
```

---

## 5. Get All Resources by Session ID

### Endpoint
```
GET /registrations/resources/session/:sessionId
```

### Description
Retrieves all resources associated with a specific session. User must be registered for the event containing the session.

### Parameters
- `sessionId` (path parameter, required): The session ID (integer)

### Example Request
```bash
curl -X GET \
  http://localhost:3456/registrations/resources/session/101 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Success Response (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "data": [
      {
        "id": 3,
        "event_id": null,
        "session_id": 101,
        "resource_type": "FILE",
        "name": "Workshop Materials",
        "url_source": "http://localhost:3456/static/uploads/resources/materials-1733765900000.pdf",
        "description": "Workshop slides and exercises",
        "file_size_bytes": 5242880,
        "mime_type": "application/pdf",
        "is_public": true,
        "is_active": true,
        "download_count": 8,
        "tags": ["workshop", "materials"],
        "upload_date": "2025-12-09T16:35:10.000Z",
        "created_at": "2025-12-09T16:35:10.000Z",
        "updated_at": "2025-12-09T16:35:10.000Z"
      }
    ],
    "total": 1
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "status": 400,
  "success": false,
  "message": "Session ID là bắt buộc."
}
```

#### 403 Forbidden
```json
{
  "status": 403,
  "success": false,
  "message": "Bạn không có quyền truy cập phiên này."
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy phiên."
}
```

---

## 6. Update Resource

### Endpoint
```
PUT /registrations/resources/:id
```

### Description
Updates an existing resource. User must be registered for the associated event/session.

### Parameters
- `id` (path parameter, required): The resource ID
- All fields are optional for update

### Example Request - Update File
```bash
curl -X PUT \
  http://localhost:3456/registrations/resources/1 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: multipart/form-data' \
  -F 'name=Updated Event Schedule' \
  -F 'file=@/path/to/updated-schedule.pdf' \
  -F 'description=Updated schedule with new sessions' \
  -F 'tags=["schedule", "pdf", "updated"]'
```

### Example Request - Update Metadata Only
```bash
curl -X PUT \
  http://localhost:3456/registrations/resources/2 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "description": "Updated venue location with parking information",
    "is_active": true,
    "tags": ["location", "venue", "maps", "parking"]
  }'
```

### Success Response (200 OK)
```json
{
  "status": 200,
  "success": true,
  "message": "Cập nhật tài nguyên thành công.",
  "data": {
    "id": 1,
    "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
    "session_id": null,
    "resource_type": "FILE",
    "name": "Updated Event Schedule",
    "url_source": "http://localhost:3456/static/uploads/resources/updated-schedule-1733766000000.pdf",
    "description": "Updated schedule with new sessions",
    "file_size_bytes": 2654208,
    "mime_type": "application/pdf",
    "is_public": true,
    "is_active": true,
    "download_count": 5,
    "tags": ["schedule", "pdf", "updated"],
    "upload_date": "2025-12-09T16:34:51.234Z",
    "created_at": "2025-12-09T16:34:51.234Z",
    "updated_at": "2025-12-09T16:40:00.000Z"
  }
}
```

### Error Responses

#### 403 Forbidden
```json
{
  "status": 403,
  "success": false,
  "message": "Bạn không có quyền truy cập tài nguyên này."
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy tài nguyên."
}
```

---

## 7. Delete Resource

### Endpoint
```
DELETE /registrations/resources/:id
```

### Description
Deletes a resource and its associated file (if FILE type). User must be registered for the associated event/session.

### Parameters
- `id` (path parameter, required): The resource ID

### Example Request
```bash
curl -X DELETE \
  http://localhost:3456/registrations/resources/1 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Success Response (200 OK)
```json
{
  "status": 200,
  "success": true,
  "message": "Xóa tài nguyên thành công.",
  "data": {
    "id": 1,
    "event_id": "bf883a2e-a119-49dd-85a6-a81192a6898c",
    "session_id": null,
    "resource_type": "FILE",
    "name": "Updated Event Schedule",
    "url_source": "http://localhost:3456/static/uploads/resources/updated-schedule-1733766000000.pdf",
    "description": "Updated schedule with new sessions",
    "file_size_bytes": 2654208,
    "mime_type": "application/pdf",
    "is_public": true,
    "is_active": true,
    "download_count": 5,
    "tags": ["schedule", "pdf", "updated"],
    "upload_date": "2025-12-09T16:34:51.234Z",
    "created_at": "2025-12-09T16:34:51.234Z",
    "updated_at": "2025-12-09T16:40:00.000Z"
  }
}
```

### Error Responses

#### 403 Forbidden
```json
{
  "status": 403,
  "success": false,
  "message": "Bạn không có quyền truy cập tài nguyên này."
}
```

#### 404 Not Found
```json
{
  "status": 404,
  "success": false,
  "message": "Không tìm thấy tài nguyên."
}
```

---

## 8. Check Resource Activation

### Endpoint
```
GET /registrations/resources/:id/check-activation
```

### Description
Checks if a resource is active and visible. Does not require event registration.

### Parameters
- `id` (path parameter, required): The resource ID

### Example Request
```bash
curl -X GET \
  http://localhost:3456/registrations/resources/1/check-activation \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Success Response - Active Resource (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "exists": true,
    "is_active": true,
    "is_visible": true
  }
}
```

### Success Response - Inactive Resource (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "exists": true,
    "is_active": false,
    "is_visible": false
  }
}
```

### Success Response - Non-existent Resource (200 OK)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "exists": false,
    "is_active": false,
    "is_visible": false
  }
}
```

---

## Notes

### File Upload Limits
- Maximum file size: **50MB**
- Supported file types: All MIME types are accepted
- Files are stored in: `/static/uploads/resources/`

### Resource Visibility
- `is_public`: Controls whether the resource is publicly accessible
- `is_active`: Controls whether the resource is currently active
- `is_visible`: Computed as `is_active && is_public`

### Tags
- Tags are stored as an array of strings
- Used for categorization and searching
- Examples: `["schedule", "pdf", "important"]`

### Download Tracking
- `download_count`: Automatically incremented when resource is downloaded
- Initial value: 0

### Authentication Token
To get a registration authentication token:
1. Register as a user via `/registrations/auth/register`
2. Login via `/registrations/auth/login`
3. Use the returned JWT token in the Authorization header

### Access Control
- Users can only create/update/delete resources for events/sessions they are registered for
- Users must be registered for an event to access its resources
- The `check-activation` endpoint is accessible to all authenticated users
