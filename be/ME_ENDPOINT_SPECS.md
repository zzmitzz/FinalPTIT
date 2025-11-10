# `/auth/me` Endpoint Specifications

## Admin `/admin/auth/me`

### Request
- **Method:** `GET`
- **Path:** `/admin/auth/me`
- **Headers Required:**
  - `Authorization: Bearer <access_token>`
- **Query Parameters:** None
- **Request Body:** None

### Response (200 OK)
```json
{
  "_id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role_ids": ["uuid", ...]
}
```

**Note:** Password field is NOT included in the response (Sequelize toJSON excludes it by default).

### Authentication Flow
1. Middleware `requireAuthentication` extracts token from `Authorization` header
2. Verifies token and checks token blocklist
3. Extracts `user_id` from token
4. Finds admin by ID and sets `req.currentUser`
5. Controller calls `adminAuthService.profile(req.currentUser._id)`
6. Returns admin profile

---

## Organizer `/organizer/auth/me`

### Request
- **Method:** `GET`
- **Path:** `/organizer/auth/me`
- **Headers Required:**
  - `Authorization: Bearer <access_token>`
- **Query Parameters:** None
- **Request Body:** None

### Response (200 OK)
```json
{
  "_id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "avatar": "string | null",
  "created_at": "ISO date string",
  "updated_at": "ISO date string"
}
```

**Note:** Password field is NOT included in the response.

### Authentication Flow
1. Middleware `requireOrganizerAuthentication` extracts token from `Authorization` header
2. Verifies token and checks token blocklist
3. Extracts `user_id` from token
4. Finds organizer by ID and sets `req.currentOrganizer`
5. Route handler calls `organizerAuthService.profile(req.currentOrganizer._id)`
6. Returns organizer profile

---

## Frontend Expected Format

The frontend `UserProfile` interface expects:
```typescript
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
}
```

Both endpoints return these fields, plus additional fields that the frontend can safely ignore.

---

## Common Issues

1. **401 Unauthorized:** Token not provided, invalid, expired, or in blocklist
2. **Token not in Authorization header:** Must be `Bearer <token>`
3. **Wrong token type:** Token must be of type `AUTHORIZATION`
4. **User not found:** User ID in token doesn't exist in database

---

## Testing

### Using curl:

**Admin:**
```bash
curl -X GET http://localhost:3456/admin/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Organizer:**
```bash
curl -X GET http://localhost:3456/organizer/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```




