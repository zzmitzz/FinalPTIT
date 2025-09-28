import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import {EVENT_MINI_GAME, PERMISSION} from '@/models'

import requireAdminAuthentication from '@/app/middleware/admin/require-admin-authentication'
import requirePermissions from '@/app/middleware/admin/require-permission'

import * as eventRequest from '@/app/requests/admin/event.request'
import * as eventMiddleware from '@/app/middleware/admin/event.middleware'
import * as eventController from '@/app/controllers/admin/event.controller'
import validate from '@/app/middleware/common/validate'
import {readRegistrations} from '@/app/requests/organizer/event.request'

const eventRouter = Router()

eventRouter.use(asyncHandler(requireAdminAuthentication))

eventRouter.get(
    '/',
    asyncHandler(requirePermissions(PERMISSION.LIST_EVENT)),
    asyncHandler(validate(eventRequest.getListEvent)),
    asyncHandler(eventController.getListEvent)
)

eventRouter.get(
    '/:eventId',
    asyncHandler(requirePermissions(PERMISSION.READ_EVENT)),
    asyncHandler(eventMiddleware.checkEventId),
    asyncHandler(eventController.getDetailEvent),
)

eventRouter.get(
    '/:eventId/registrations',
    asyncHandler(requirePermissions(PERMISSION.READ_EVENT)),
    asyncHandler(eventMiddleware.checkEventId),
    asyncHandler(validate(readRegistrations)),
    asyncHandler(eventController.getRegistrationsOfEvent),
)

eventRouter.put(
    '/:eventId/approval',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_EVENT)),
    asyncHandler(eventMiddleware.checkEventId),
    eventMiddleware.checkActionEvent('approval'),
    asyncHandler(eventController.approvalEvent),
)

eventRouter.patch(
    '/:eventId/cancel',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_EVENT)),
    asyncHandler(eventMiddleware.checkEventId),
    eventMiddleware.checkActionEvent('cancel'),
    asyncHandler(eventController.cancelEvent),
)

eventRouter.patch(
    '/:eventId/toggle-lock/:action(LOCKED|UNLOCKED)',
    asyncHandler(requirePermissions(PERMISSION.UPDATE_EVENT)),
    asyncHandler(eventMiddleware.checkEventId),
    eventMiddleware.checkActionEvent('locked'),
    asyncHandler(eventController.lockEvent),
)

eventRouter.patch(
    '/:eventId/assign-booth',
    asyncHandler(requirePermissions(PERMISSION.ASSIGN_BOOTH_TO_EVENT)),
    asyncHandler(eventMiddleware.checkEventId),
    eventMiddleware.checkActionEvent('assign'),
    asyncHandler(validate(eventRequest.assignBoothToEvent)),
    asyncHandler(eventController.assignBoothToEvent),
)

eventRouter.get(
    `/:eventId/mini-game/:MINI_GAME_CODE(${Object.values(EVENT_MINI_GAME).join('|')})`,
    asyncHandler(requirePermissions(PERMISSION.READ_EVENT)),
    asyncHandler(eventMiddleware.checkEventId),
    eventMiddleware.checkMiniGameCode,
    asyncHandler(eventController.readPrizesOfEvent),
)

export default eventRouter
