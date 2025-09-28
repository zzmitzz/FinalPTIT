import {Router} from 'express'
import * as prizeMiddleware from '@/app/middleware/organizer/prize.middleware'
import * as prizeRequest from '@/app/requests/organizer/prize.request'
import * as prizeController from '@/app/controllers/organizer/prize.controller'

import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-organizer-authentication'

const prizeRouter = Router()

prizeRouter.use(asyncHandler(requireOrganizerAuthentication))

prizeRouter.post(
    '/',
    asyncHandler(validate(prizeRequest.createItem)),
    asyncHandler(prizeController.createItem)
)

prizeRouter.put(
    '/:prizeId',
    asyncHandler(prizeMiddleware.checkPrizeId),
    asyncHandler(validate(prizeRequest.updateItem)),
    asyncHandler(prizeController.updateItem)
)

prizeRouter.delete(
    '/:prizeId',
    asyncHandler(prizeMiddleware.checkPrizeId),
    asyncHandler(prizeController.deleteItem)
)

export default prizeRouter
