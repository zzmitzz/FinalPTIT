# Organizer-Scoped System Admin Routing Guide

## Overview

The system now supports two types of system admins:

1. **Global Admins** - System administrators with full access (redirected to Admin Web App)
2. **Organizer-Scoped Admins** - Administrators limited to specific organizer(s) (redirected to Organizer Web App)

## Backend Implementation

### Login Response

When a system user logs in, the response includes scope information:

**Endpoint**: `POST /admin/system-users/login`

**Response**:

```json
{
  "access_token": "eyJhbGci...",
  "expire_in": 86400,
  "auth_type": "Bearer Token",
  "user": {
    "_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "organizer_id": "org-uuid-123" | null,
    "scope": "GLOBAL" | "ORGANIZER",
    "is_global_admin": true | false
  }
}
```

**Key Fields**:

- `user.organizer_id`:
  - `null` = Global Admin (can manage entire system)
  - `"uuid"` = Organizer-Scoped Admin (can only manage specific organizer)
- `user.scope`:
  - `"GLOBAL"` = Route to Admin Web App
  - `"ORGANIZER"` = Route to Organizer Web App
- `user.is_global_admin`:
  - `true` = Has system-wide permissions
  - `false` = Restricted to organizer scope

### Profile Endpoint

**Endpoint**: `GET /admin/system-users/me`

**Response**:

```json
{
  "_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "organizer_id": "org-uuid" | null,
  "scope": "GLOBAL" | "ORGANIZER",
  "is_global_admin": true | false,
  "roles": [...]
}
```

## Frontend Implementation

### 1. React/Vue Login Handler

```javascript
async function handleLogin(email, password) {
  const response = await axios.post('/admin/system-users/login', {
    email,
    password,
  })

  const {access_token, user} = response.data

  // Store token
  localStorage.setItem('token', access_token)
  localStorage.setItem('user', JSON.stringify(user))

  // Route based on scope
  if (user.scope === 'GLOBAL') {
    // Redirect to Admin Web App
    window.location.href = '/admin/dashboard'
    // or: router.push('/admin/dashboard');
  } else if (user.scope === 'ORGANIZER') {
    // Redirect to Organizer Web App
    window.location.href = '/organizer/dashboard'
    // or: router.push('/organizer/dashboard');
  }
}
```

### 2. Route Guard (React Router Example)

```javascript
import {Navigate} from 'react-router-dom'

function ProtectedAdminRoute({children}) {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) {
    return <Navigate to="/login" />
  }

  // Only allow global admins
  if (user.scope !== 'GLOBAL') {
    return <Navigate to="/organizer/dashboard" />
  }

  return children
}

function ProtectedOrganizerRoute({children}) {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) {
    return <Navigate to="/login" />
  }

  // Allow both global admins and organizer-scoped admins
  if (user.scope !== 'ORGANIZER' && !user.is_global_admin) {
    return <Navigate to="/admin/dashboard" />
  }

  return children
}

// Usage in routes
;<Routes>
  <Route
    path="/admin/*"
    element={
      <ProtectedAdminRoute>
        <AdminApp />
      </ProtectedAdminRoute>
    }
  />

  <Route
    path="/organizer/*"
    element={
      <ProtectedOrganizerRoute>
        <OrganizerApp />
      </ProtectedOrganizerRoute>
    }
  />
</Routes>
```

### 3. Vue Router Example

```javascript
// router/index.js
const router = createRouter({
  routes: [
    {
      path: '/admin',
      component: AdminLayout,
      meta: {requiresAuth: true, scope: 'GLOBAL'},
      beforeEnter: (to, from, next) => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user?.scope !== 'GLOBAL') {
          next('/organizer/dashboard')
        } else {
          next()
        }
      },
    },
    {
      path: '/organizer',
      component: OrganizerLayout,
      meta: {requiresAuth: true, scope: 'ORGANIZER'},
      beforeEnter: (to, from, next) => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user?.organizer_id && user?.scope !== 'GLOBAL') {
          next('/admin/dashboard')
        } else {
          next()
        }
      },
    },
  ],
})
```

## Use Cases

### Use Case 1: Global System Admin

```
Login → scope: "GLOBAL", organizer_id: null
→ Redirect to: /admin/dashboard
→ Can access: All system features, all organizers, all events
```

### Use Case 2: Single Organizer Admin

```
Login → scope: "ORGANIZER", organizer_id: "org-123"
→ Redirect to: /organizer/dashboard
→ Can access: Only events/resources for org-123
→ Uses organizer web app (same as regular organizer login)
```

### Use Case 3: Multi-Organizer Admin

```
Login → scope: "ORGANIZER", organizer_id: "org-123"
→ Has roles for: org-123, org-456, org-789
→ Redirect to: /organizer/dashboard with organizer selector
→ Can access: Events/resources for org-123, org-456, org-789
```

## Architecture Benefits

### Unified Organizer Experience

- Organizer-scoped system users use the **same web app** as regular organizers
- No need to maintain separate admin interfaces for organizer management
- Consistent UX for all organizer-level operations

### Clear Separation

- **Admin Web App** (`/admin/*`):
  - System user management
  - Role/permission management
  - Organizer account creation
  - Event approval workflows
  - System-wide analytics
- **Organizer Web App** (`/organizer/*`):
  - Event creation/management
  - Session management
  - Speaker management
  - Registration forms
  - Attendee check-ins
  - Notifications

### Security

- Backend validates `organizer_id` on every request
- Middleware ensures organizer-scoped users can only access their resources
- Global admins have `organizer_id = null` and bypass restrictions

## Database Structure

```sql
-- Global Admin
INSERT INTO system_users (organizer_id) VALUES (NULL);
INSERT INTO system_user_roles (organizer_id) VALUES (NULL); -- Global role assignment

-- Organizer-Scoped Admin
INSERT INTO system_users (organizer_id) VALUES ('org-123');
INSERT INTO system_user_roles (organizer_id) VALUES ('org-123'); -- Scoped role assignment
```

## Migration Path

If you have existing system users that should be organizer-scoped:

```sql
-- Convert existing system user to organizer-scoped
UPDATE system_users
SET organizer_id = 'target-organizer-uuid'
WHERE email = 'user@example.com';

-- Update their role assignments to be organizer-scoped
UPDATE system_user_roles
SET organizer_id = 'target-organizer-uuid'
WHERE system_user_id = (SELECT _id FROM system_users WHERE email = 'user@example.com');
```

## API Integration Example

```javascript
// services/auth.service.js
export const authService = {
  async login(email, password) {
    const response = await api.post('/admin/system-users/login', {
      email,
      password,
    })

    const {access_token, user} = response.data

    // Store authentication data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))

    return {
      token: access_token,
      user,
      redirectTo: this.getRedirectPath(user),
    }
  },

  getRedirectPath(user) {
    if (user.scope === 'GLOBAL') {
      return '/admin/dashboard'
    } else if (user.scope === 'ORGANIZER') {
      return '/organizer/dashboard'
    }
    return '/'
  },

  async getCurrentUser() {
    const response = await api.get('/admin/system-users/me')
    localStorage.setItem('user', JSON.stringify(response.data))
    return response.data
  },

  isGlobalAdmin() {
    const user = JSON.parse(localStorage.getItem('user'))
    return user?.is_global_admin === true
  },

  getOrganizerId() {
    const user = JSON.parse(localStorage.getItem('user'))
    return user?.organizer_id || null
  },
}
```

## Testing Scenarios

### Test 1: Global Admin Login

```bash
curl -X POST http://localhost:3456/admin/system-users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@ptit.com", "password": "Admin@123"}'

# Expected: scope: "GLOBAL", organizer_id: null
```

### Test 2: Organizer-Scoped Admin Login

```bash
# First create an organizer-scoped system user
curl -X POST http://localhost:3456/admin/system-users \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Event Manager",
    "email": "manager@org.com",
    "password": "Pass@123",
    "organizer_id": "org-uuid-here"
  }'

# Then login
curl -X POST http://localhost:3456/admin/system-users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@org.com", "password": "Pass@123"}'

# Expected: scope: "ORGANIZER", organizer_id: "org-uuid-here"
```
