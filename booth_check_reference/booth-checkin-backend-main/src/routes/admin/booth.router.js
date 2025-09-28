import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import {PERMISSION} from '@/models'

import validate from '@/app/middleware/common/validate'
import requireAdminAuthentication from '@/app/middleware/admin/require-admin-authentication'
import requirePermissions from '@/app/middleware/admin/require-permission'

import * as boothMiddleware from '@/app/middleware/admin/booth.middleware'
import * as boothRequest from '@/app/requests/admin/booth.request'
import * as boothController from '@/app/controllers/admin/booth.controller'
import * as organizerBoothRequest from '@/app/requests/organizer/booth.request'
import * as organizerBoothController from '@/app/controllers/organizer/booth.controller'

const boothRouter = Router()

boothRouter.use(asyncHandler(requireAdminAuthentication))

boothRouter.get(
    '/',
    asyncHandler(requirePermissions(PERMISSION.LIST_BOOTH, PERMISSION.ASSIGN_BOOTH_TO_EVENT)),
    asyncHandler(boothController.getListBooth)
)

boothRouter.get(
    '/events-can-assign',
    asyncHandler(requirePermissions(PERMISSION.ASSIGN_BOOTH_TO_EVENT)),
    asyncHandler(boothController.getListEventCanAssign)
)

boothRouter.post(
    '/',
    asyncHandler(requirePermissions(PERMISSION.CREATE_BOOTH)),
    asyncHandler(validate(boothRequest.createBooth)),
    asyncHandler(boothController.createBooth)
)

boothRouter.put(
    '/:boothId',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_BOOTH)),
    asyncHandler(boothMiddleware.checkBoothId),
    asyncHandler(validate(boothRequest.updateBooth)),
    asyncHandler(boothController.updateBooth),
)

boothRouter.delete(
    '/:boothId',
    asyncHandler(requirePermissions(PERMISSION.DELETE_BOOTH)),
    asyncHandler(boothMiddleware.checkBoothId),
    asyncHandler(boothController.removeBooth),
)

boothRouter.patch(
    '/:boothId/assign-to-event',
    asyncHandler(requirePermissions(PERMISSION.ASSIGN_BOOTH_TO_EVENT)),
    asyncHandler(boothMiddleware.checkBoothId),
    asyncHandler(validate(boothRequest.assignToEvent)),
    asyncHandler(boothController.assignToEvent),
)

boothRouter.patch(
    '/:boothId/setting',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_BOOTH)),
    asyncHandler(boothMiddleware.checkBoothId),
    asyncHandler(validate(organizerBoothRequest.updateBoothSetting)),
    asyncHandler(organizerBoothController.updateBoothSetting),
)

export default boothRouter
