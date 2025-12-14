import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as rbacMiddleware from '@/app/middleware/rbac.middleware'
import * as systemUserController from '@/app/controllers/admin/system-user.controller'

const systemUserRouter = Router()

// ==================== Authentication Routes (Public) ====================
systemUserRouter.post('/register', asyncHandler(systemUserController.register))
systemUserRouter.post('/login', asyncHandler(systemUserController.login))

// ==================== Protected Routes ====================
// Profile & Authentication
systemUserRouter.post(
    '/logout',
    rbacMiddleware.verifySystemUserToken,
    asyncHandler(systemUserController.logout)
)

systemUserRouter.get('/me', rbacMiddleware.verifySystemUserToken, asyncHandler(systemUserController.me))

systemUserRouter.put(
    '/profile',
    rbacMiddleware.verifySystemUserToken,
    asyncHandler(systemUserController.updateProfile)
)

systemUserRouter.put(
    '/change-password',
    rbacMiddleware.verifySystemUserToken,
    asyncHandler(systemUserController.changePassword)
)

// ==================== User Management (Admin Only) ====================
systemUserRouter.get(
    '/',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:READ', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.listSystemUsers)
)

systemUserRouter.get(
    '/:id',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:READ', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.getSystemUser)
)

systemUserRouter.post(
    '/',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:CREATE', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.createSystemUser)
)

systemUserRouter.put(
    '/:id',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:UPDATE', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.updateSystemUser)
)

systemUserRouter.delete(
    '/:id',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:DELETE', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.deleteSystemUser)
)

systemUserRouter.put(
    '/:id/deactivate',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:UPDATE', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.deactivateSystemUser)
)

systemUserRouter.put(
    '/:id/activate',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:UPDATE', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.activateSystemUser)
)

// ==================== Role & Permission Management ====================
systemUserRouter.post(
    '/:id/roles',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('ROLE:ASSIGN', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.assignRoles)
)

systemUserRouter.delete(
    '/:id/roles',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('ROLE:ASSIGN', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.removeRoles)
)

systemUserRouter.get(
    '/:id/permissions',
    rbacMiddleware.verifySystemUserToken,
    rbacMiddleware.requirePermission('SYSTEM_USER:READ', 'SYSTEM_USER:MANAGE'),
    asyncHandler(systemUserController.getUserPermissions)
)

export default systemUserRouter
