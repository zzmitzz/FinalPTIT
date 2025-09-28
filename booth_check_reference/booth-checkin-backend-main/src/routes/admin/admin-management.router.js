import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import {PERMISSION} from '@/models'

import validate from '@/app/middleware/common/validate'
import requireAdminAuthentication from '@/app/middleware/admin/require-admin-authentication'
import requirePermissions from '@/app/middleware/admin/require-permission'

import * as adminMiddleware from '@/app/middleware/admin/admin.middleware'
import * as adminRequest from '@/app/requests/admin/admin.request'
import * as adminController from '@/app/controllers/admin/admin.controller'

const router = Router()

router.use(asyncHandler(requireAdminAuthentication))

router.get(
    '/',
    asyncHandler(requirePermissions(PERMISSION.LIST_ADMIN)),
    asyncHandler(adminController.getListAdmin)
)

router.post(
    '/',
    asyncHandler(requirePermissions(PERMISSION.CREATE_ADMIN)),
    asyncHandler(validate(adminRequest.createAdmin)),
    asyncHandler(adminController.createAdmin)
)

router.put(
    '/:adminId',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_ADMIN)),
    asyncHandler(adminMiddleware.checkAdminId),
    asyncHandler(validate(adminRequest.updateAdmin)),
    asyncHandler(adminController.updateAdmin),
)

router.patch(
    '/:adminId/change-password',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_ADMIN)),
    asyncHandler(adminMiddleware.checkAdminId),
    asyncHandler(validate(adminRequest.changePassword)),
    asyncHandler(adminController.changePassword),
)

router.delete(
    '/:adminId',
    asyncHandler(requirePermissions(PERMISSION.DELETE_ADMIN)),
    asyncHandler(adminMiddleware.checkAdminId),
    asyncHandler(adminController.removeAdmin)
)

export default router
