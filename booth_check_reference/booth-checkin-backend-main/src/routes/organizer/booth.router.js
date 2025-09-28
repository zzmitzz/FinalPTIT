import requireOrganizerAuthentication from '@/app/middleware/organizer/require-organizer-authentication'
import {asyncHandler} from '@/utils/helpers'
import {Router} from 'express'

import * as boothMiddleware from '@/app/middleware/organizer/booth.middleware'
import * as boothRequest from '@/app/requests/organizer/booth.request'
import * as boothController from '@/app/controllers/organizer/booth.controller'
import validate from '@/app/middleware/common/validate'

const boothRouter = Router()

boothRouter.use(asyncHandler(requireOrganizerAuthentication))

boothRouter.get('/', asyncHandler(boothController.getListBooth))

boothRouter.put(
    '/:boothId',
    asyncHandler(boothMiddleware.checkBoothId),
    asyncHandler(validate(boothRequest.updateBoothSetting)),
    asyncHandler(boothController.updateBoothSetting)
)

export default boothRouter
