import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as rbacMiddleware from '@/app/middleware/rbac.middleware'
import * as roleController from '@/app/controllers/admin/role.controller'

const roleRouter = Router()

// All routes require authentication and appropriate permissions
roleRouter.use(rbacMiddleware.verifySystemUserToken)

// ==================== Role CRUD ====================
roleRouter.get(
    '/',
    rbacMiddleware.requirePermission('ROLE:READ', 'ROLE:MANAGE'),
    asyncHandler(roleController.listRoles)
)

roleRouter.get(
    '/:id',
    rbacMiddleware.requirePermission('ROLE:READ', 'ROLE:MANAGE'),
    asyncHandler(roleController.getRole)
)

roleRouter.post(
    '/',
    rbacMiddleware.requirePermission('ROLE:CREATE', 'ROLE:MANAGE'),
    asyncHandler(roleController.createRole)
)

roleRouter.put(
    '/:id',
    rbacMiddleware.requirePermission('ROLE:UPDATE', 'ROLE:MANAGE'),
    asyncHandler(roleController.updateRole)
)

roleRouter.delete(
    '/:id',
    rbacMiddleware.requirePermission('ROLE:DELETE', 'ROLE:MANAGE'),
    asyncHandler(roleController.deleteRole)
)

// ==================== Permission Management ====================
roleRouter.post(
    '/:id/permissions',
    rbacMiddleware.requirePermission('ROLE:UPDATE', 'ROLE:MANAGE', 'PERMISSION:ASSIGN'),
    asyncHandler(roleController.assignPermissions)
)

roleRouter.delete(
    '/:id/permissions',
    rbacMiddleware.requirePermission('ROLE:UPDATE', 'ROLE:MANAGE', 'PERMISSION:ASSIGN'),
    asyncHandler(roleController.removePermissions)
)

roleRouter.get(
    '/:id/permissions',
    rbacMiddleware.requirePermission('ROLE:READ', 'ROLE:MANAGE'),
    asyncHandler(roleController.getRolePermissions)
)

// ==================== User Assignment ====================
roleRouter.post(
    '/:id/users',
    rbacMiddleware.requirePermission('ROLE:ASSIGN', 'ROLE:MANAGE'),
    asyncHandler(roleController.assignSystemUsers)
)

roleRouter.delete(
    '/:id/users',
    rbacMiddleware.requirePermission('ROLE:ASSIGN', 'ROLE:MANAGE'),
    asyncHandler(roleController.removeSystemUsers)
)

export default roleRouter
