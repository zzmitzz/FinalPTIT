import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as rbacMiddleware from '@/app/middleware/rbac.middleware'
import * as permissionController from '@/app/controllers/admin/permission.controller'

const permissionRouter = Router()

// All routes require authentication and appropriate permissions
permissionRouter.use(rbacMiddleware.verifySystemUserToken)

// ==================== READ-ONLY Permission Routes ====================
// Permissions are system-managed via database seeds and should NOT be editable by users
// Only read operations are allowed for displaying permissions in the UI

// Get all permissions (paginated)
permissionRouter.get(
    '/',
    rbacMiddleware.requirePermission('PERMISSION:READ'),
    asyncHandler(permissionController.listPermissions)
)

// Get permissions grouped by resource (for easier UI display)
permissionRouter.get(
    '/grouped',
    rbacMiddleware.requirePermission('PERMISSION:READ'),
    asyncHandler(permissionController.getPermissionsByResource)
)

// Get all unique resource names
permissionRouter.get(
    '/resources',
    rbacMiddleware.requirePermission('PERMISSION:READ'),
    asyncHandler(permissionController.getResources)
)

// Get all unique action types
permissionRouter.get(
    '/actions',
    rbacMiddleware.requirePermission('PERMISSION:READ'),
    asyncHandler(permissionController.getActions)
)

// Get single permission by ID
permissionRouter.get(
    '/:id',
    rbacMiddleware.requirePermission('PERMISSION:READ'),
    asyncHandler(permissionController.getPermission)
)

// Get permission by code (e.g., "USER:CREATE")
permissionRouter.get(
    '/code/:code',
    rbacMiddleware.requirePermission('PERMISSION:READ'),
    asyncHandler(permissionController.getPermissionByCode)
)

export default permissionRouter
