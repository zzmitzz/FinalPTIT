import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import requireAdminAuthentication from '@/app/middleware/admin/require-admin-authentication'
import * as organizerRequest from '@/app/requests/admin/organizer.request'
import * as organizerController from '@/app/controllers/admin/organizer.controller'
import * as organizerMiddleware from '@/app/middleware/admin/organizer.middleware'
import validate from '@/app/middleware/common/validate'
import requirePermissions from '@/app/middleware/admin/require-permission'
import { PERMISSION } from '@/models'

const organizerRouter = Router()

organizerRouter.use(asyncHandler(requireAdminAuthentication))

organizerRouter.post(
    '/',
    asyncHandler(requirePermissions(PERMISSION.CREATE_ORGANIZER)),
    asyncHandler(validate(organizerRequest.createItem)),
    asyncHandler(organizerController.createItem)
)

organizerRouter.put(
    '/:organizerId',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_ORGANIZER)),
    asyncHandler(organizerMiddleware.checkOrganizerId),
    asyncHandler(validate(organizerRequest.updateItem)),
    asyncHandler(organizerController.updateItem)
)

organizerRouter.patch(
    '/:organizerId/change-password',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_ORGANIZER)),
    asyncHandler(organizerMiddleware.checkOrganizerId),
    asyncHandler(validate(organizerRequest.changePassword)),
    asyncHandler(organizerController.changePassword)
)

organizerRouter.delete(
    '/:organizerId',
    asyncHandler(requirePermissions(PERMISSION.DELETE_ORGANIZER)),
    asyncHandler(organizerMiddleware.checkOrganizerId),
    asyncHandler(organizerController.deleteItem)
)

organizerRouter.get(
    '/',
    asyncHandler(requirePermissions(PERMISSION.LIST_ORGANIZER)),
    asyncHandler(validate(organizerRequest.getList)),
    asyncHandler(organizerController.readRoot)
)

organizerRouter.get(
    '/:organizerId/statistical',
    asyncHandler(organizerMiddleware.checkOrganizerId),
    asyncHandler(organizerController.details)
)

organizerRouter.get(
    '/:organizerId/events',
    asyncHandler(organizerMiddleware.checkOrganizerId),
    asyncHandler(validate(organizerRequest.getListEventByOrganizerId)),
    asyncHandler(organizerController.getListEventByOrganizerId)
)

export default organizerRouter
