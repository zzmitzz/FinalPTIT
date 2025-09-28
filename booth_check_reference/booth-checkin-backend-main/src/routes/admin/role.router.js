import requireAdminAuthentication from '@/app/middleware/admin/require-admin-authentication'
import {asyncHandler} from '@/utils/helpers'
import {Router} from 'express'
import * as roleController from '@/app/controllers/admin/role.controller'
import * as roleRequest from '@/app/requests/admin/role.request'
import * as roleMiddleware from '@/app/middleware/admin/role.middleware'
import validate from '@/app/middleware/common/validate'
import requirePermissions from '@/app/middleware/admin/require-permission'
import {PERMISSION} from '@/models'

const roleRouter = Router()

roleRouter.use(asyncHandler(requireAdminAuthentication))

roleRouter.get(
    '/',
    asyncHandler(requirePermissions(PERMISSION.LIST_ROLE, PERMISSION.LIST_ADMIN, PERMISSION.CREATE_ADMIN, PERMISSION.UPDATE_ADMIN)),
    asyncHandler(roleController.readRoot),
)

roleRouter.get(
    '/permission-types',
    asyncHandler(requirePermissions(PERMISSION.LIST_ROLE)),
    asyncHandler(roleController.readPermissionTypes),
)

roleRouter.post(
    '/',
    asyncHandler(requirePermissions(PERMISSION.CREATE_ROLE)),
    asyncHandler(validate(roleRequest.createItem)),
    asyncHandler(roleController.createItem),
)

roleRouter.put(
    '/:roleId',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleMiddleware.requireRoleNotProtected),
    asyncHandler(validate(roleRequest.updateItem)),
    asyncHandler(roleController.updateItem),
)

roleRouter.delete(
    '/:roleId',
    asyncHandler(requirePermissions(PERMISSION.DELETE_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleMiddleware.requireRoleNotProtected),
    asyncHandler(roleController.deleteItem),
)

roleRouter.get(
    '/:roleId/permissions',
    asyncHandler(requirePermissions(PERMISSION.LIST_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleController.readPermissionOfRole),
)

roleRouter.put(
    '/:roleId/update-permission-for-role/:permissionId',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_PERMISSION_FOR_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleMiddleware.requireRoleNotProtected),
    asyncHandler(roleMiddleware.verifyPermissionId),
    asyncHandler(roleController.switchPermissionOfRole),
)

roleRouter.get(
    '/:roleId/employees',
    asyncHandler(requirePermissions(PERMISSION.LIST_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleController.readEmployeesWithRole),
)

roleRouter.get(
    '/:roleId/employees-without-role',
    asyncHandler(requirePermissions(PERMISSION.LIST_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleController.readEmployeesWithoutRole),
)

roleRouter.put(
    '/:roleId/add-admin',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleMiddleware.requireRoleNotProtected),
    asyncHandler(validate(roleRequest.addAdminForRole)),
    asyncHandler(roleController.addAdminForRole),
)

roleRouter.delete(
    '/:roleId/delete-admin-in-role/:adminId',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_ROLE)),
    asyncHandler(roleMiddleware.verifyRoleId),
    asyncHandler(roleMiddleware.requireRoleNotProtected),
    asyncHandler(roleMiddleware.verifyAdminId),
    asyncHandler(roleController.deleteAdminInRole),
)

export default roleRouter
