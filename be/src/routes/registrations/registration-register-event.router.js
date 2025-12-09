import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'
import * as registrationRegisterEventController from '@/app/controllers/registrations/registration-register-event.controller'
import * as registrationRegisterEventRequest from '@/app/requests/registrations/registration-register-event.request'

const registrationRegisterEventRouter = Router()

// All routes require authentication
registrationRegisterEventRouter.use(asyncHandler(requireRegistrationAuthentication))

/**
 * @swagger
 * /registrations/registered-events:
 *   get:
 *     summary: Get all events the authenticated user is registered for
 *     description: Retrieve a list of all events that the current authenticated user has registered for
 *     tags: [Registration Register Event]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of registered events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: integer
 *                         description: Registration register event ID
 *                       event_id:
 *                         type: string
 *                         description: Event ID
 *                       registration_id:
 *                         type: string
 *                         description: Registration ID
 *                       is_registered:
 *                         type: boolean
 *                         description: Registration status
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Registration date
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Last update date
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
registrationRegisterEventRouter.get(
    '/',
    asyncHandler(registrationRegisterEventController.getMyRegisteredEvents)
)

/**
 * @swagger
 * /registrations/registered-events/by-month:
 *   get:
 *     summary: Get registered events by month and year
 *     description: Retrieve all events that the authenticated user has registered for in a specific month and year (filtered by event start_time)
 *     tags: [Registration Register Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *         description: Year (e.g., 2024)
 *     responses:
 *       200:
 *         description: List of registered events in the specified month retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: integer
 *                         description: Registration register event ID
 *                       event_id:
 *                         type: string
 *                         description: Event ID
 *                       registration_id:
 *                         type: string
 *                         description: Registration ID
 *                       is_registered:
 *                         type: boolean
 *                         description: Registration status
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Registration date
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Last update date
 *                       event:
 *                         type: object
 *                         description: Event details
 *       400:
 *         description: Invalid month or year
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
registrationRegisterEventRouter.get(
    '/by-month',
    asyncHandler(validate(registrationRegisterEventRequest.getByMonth)),
    asyncHandler(registrationRegisterEventController.getMyRegisteredEventsByMonth)
)




export default registrationRegisterEventRouter

