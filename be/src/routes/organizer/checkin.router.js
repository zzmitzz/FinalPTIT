import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication, {
    requireOrganizerPermission,
} from '@/app/middleware/organizer/require-authentication'
import * as checkinRequest from '@/app/requests/organizer/checkin.request'
import * as checkinController from '@/app/controllers/organizer/checkin.controller'

const checkinRouter = Router()

// All routes require authentication
checkinRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * /organizer/checkins:
 *   post:
 *     summary: Create a check-in record for a user at an event
 *     tags: [Organizer Check-ins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *               - registration_id
 *             properties:
 *               event_id:
 *                 type: string
 *                 description: Event ID (UUID)
 *               registration_id:
 *                 type: string
 *                 description: Registration ID (UUID)
 *     responses:
 *       201:
 *         description: Check-in created successfully
 *       400:
 *         description: Invalid input or user already checked in
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event does not belong to organizer
 *       404:
 *         description: Event or registration not found
 */
checkinRouter.post(
    '/',
    asyncHandler(requireOrganizerPermission('CHECKIN:VERIFY', 'CHECKIN:MANAGE')),
    asyncHandler(validate(checkinRequest.createCheckin)),
    asyncHandler(checkinController.createCheckin)
)

export default checkinRouter
