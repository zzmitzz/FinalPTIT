import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'
import * as sessionRegistrationController from '@/app/controllers/registrations/session-registration.controller'
import * as sessionRegistrationRequest from '@/app/requests/registrations/session-registration.request'

const sessionRegistrationRouter = Router()

// All routes require authentication
sessionRegistrationRouter.use(asyncHandler(requireRegistrationAuthentication))

/**
 * @swagger
 * /registrations/session-registrations/register:
 *   post:
 *     summary: Register for a session
 *     tags: [Session Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *             properties:
 *               session_id:
 *                 type: integer
 *                 description: ID of the session to register for
 *     responses:
 *       201:
 *         description: Successfully registered for session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or session is full/inactive/ended
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       409:
 *         description: Already registered for this session
 */
sessionRegistrationRouter.post(
    '/register',
    asyncHandler(validate(sessionRegistrationRequest.registerForSession)),
    asyncHandler(sessionRegistrationController.registerForSession)
)

/**
 * @swagger
 * /registrations/session-registrations/check-in:
 *   post:
 *     summary: Check in to a session
 *     tags: [Session Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *             properties:
 *               session_id:
 *                 type: integer
 *                 description: ID of the session to check in to
 *     responses:
 *       200:
 *         description: Successfully checked in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid check-in time or status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session or registration not found
 */
sessionRegistrationRouter.post(
    '/check-in',
    asyncHandler(validate(sessionRegistrationRequest.checkInToSession)),
    asyncHandler(sessionRegistrationController.checkInToSession)
)

/**
 * @swagger
 * /registrations/session-registrations/cancel:
 *   post:
 *     summary: Cancel a session registration
 *     tags: [Session Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *             properties:
 *               session_id:
 *                 type: integer
 *                 description: ID of the session to cancel registration for
 *               cancellation_reason:
 *                 type: string
 *                 description: Reason for cancellation
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Successfully cancelled registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot cancel (already cancelled or checked in)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session or registration not found
 */
sessionRegistrationRouter.post(
    '/cancel',
    asyncHandler(validate(sessionRegistrationRequest.cancelSessionRegistration)),
    asyncHandler(sessionRegistrationController.cancelSessionRegistration)
)

/**
 * @swagger
 * /registrations/session-registrations:
 *   get:
 *     summary: Get all session registrations for authenticated user
 *     tags: [Session Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [attending, waitlist, cancelled, checked_in, no_show]
 *         description: Filter by registration status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of session registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
sessionRegistrationRouter.get(
    '/',
    asyncHandler(validate(sessionRegistrationRequest.getMySessionRegistrations)),
    asyncHandler(sessionRegistrationController.getMySessionRegistrations)
)

/**
 * @swagger
 * /registrations/session-registrations/{sessionId}:
 *   get:
 *     summary: Get a specific session registration
 *     tags: [Session Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session registration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Registration not found
 */
sessionRegistrationRouter.get(
    '/:sessionId',
    asyncHandler(sessionRegistrationController.getMySessionRegistration)
)

/**
 * @swagger
 * /registrations/session-registrations/event/{eventId}/sessions:
 *   get:
 *     summary: Get all sessions for a specific event
 *     tags: [Session Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of sessions with registration info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
sessionRegistrationRouter.get(
    '/event/:eventId/sessions',
    asyncHandler(sessionRegistrationController.getSessionsByEvent)
)




export default sessionRegistrationRouter

