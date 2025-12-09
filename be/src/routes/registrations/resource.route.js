import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'
import * as resourceRequest from '@/app/requests/registrations/resource.request'
import * as resourceController from '@/app/controllers/registrations/resource.controller'
import * as resourceMiddleware from '@/app/middleware/registrations/resource.middleware'

const resourceRouter = Router()

resourceRouter.use(asyncHandler(requireRegistrationAuthentication))

resourceRouter.post(
    '/',
    asyncHandler(resourceMiddleware.verifyOwnershipForCreate),
    asyncHandler(validate(resourceRequest.createItem)),
    asyncHandler(resourceController.createItem)
)

resourceRouter.get(
    '/:id',
    asyncHandler(resourceMiddleware.verifyResourceId),
    asyncHandler(resourceMiddleware.verifyResourceOwnership),
    asyncHandler(resourceController.getItem)
)

resourceRouter.put(
    '/:id',
    asyncHandler(resourceMiddleware.verifyResourceId),
    asyncHandler(resourceMiddleware.verifyResourceOwnership),
    asyncHandler(validate(resourceRequest.updateItem)),
    asyncHandler(resourceController.updateItem)
)

resourceRouter.delete(
    '/:id',
    asyncHandler(resourceMiddleware.verifyResourceId),
    asyncHandler(resourceMiddleware.verifyResourceOwnership),
    asyncHandler(resourceController.deleteItem)
)

resourceRouter.get(
    '/event/:eventId',
    asyncHandler(resourceMiddleware.verifyEventOwnership),
    asyncHandler(resourceController.getListByEventId)
)

resourceRouter.get(
    '/session/:sessionId',
    asyncHandler(resourceMiddleware.verifySessionOwnership),
    asyncHandler(resourceController.getListBySessionId)
)

resourceRouter.get(
    '/:id/check-activation',
    asyncHandler(resourceController.checkActivation)
)

export default resourceRouter
