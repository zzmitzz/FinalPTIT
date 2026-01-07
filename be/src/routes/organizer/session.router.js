import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication, {
    requireOrganizerPermission,
} from '@/app/middleware/organizer/require-authentication'
import * as sessionRequest from '@/app/requests/organizer/session.request'
import * as sessionController from '@/app/controllers/organizer/session.controller'
import * as sessionMiddleware from '@/app/middleware/organizer/session.middleware'

const sessionRouter = Router()

// All routes require authentication
sessionRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * /organizer/sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Organizer Sessions]
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
 *               - title
 *               - start_time
 *               - end_time
 *               - place
 *             properties:
 *               event_id:
 *                 type: string
 *                 description: ID of the event this session belongs to
 *               title:
 *                 type: string
 *                 description: Session title
 *               description:
 *                 type: string
 *                 description: Session description
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: Session start time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: Session end time
 *               place:
 *                 type: string
 *                 description: Session location
 *               capacity:
 *                 type: integer
 *                 description: Maximum capacity
 *                 default: 50
 *               max_waitlist:
 *                 type: integer
 *                 description: Maximum waitlist size
 *               is_active:
 *                 type: boolean
 *                 description: Whether the session is active
 *                 default: true
 *               session_type:
 *                 type: string
 *                 description: Type of session (workshop, panel, keynote, etc.)
 *                 default: general
 *               prerequisites:
 *                 type: string
 *                 description: Session prerequisites
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Session tags
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event does not belong to organizer
 */
sessionRouter.post(
    '/',
    asyncHandler(requireOrganizerPermission('SESSION:CREATE', 'SESSION:MANAGE')),
    asyncHandler(sessionMiddleware.verifyEventOwnership),
    asyncHandler(validate(sessionRequest.createItem)),
    asyncHandler(sessionController.createItem)
)

/**
 * @swagger
 * /organizer/sessions/search:
 *   get:
 *     summary: Search sessions
 *     tags: [Organizer Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
sessionRouter.get(
    '/search',
    asyncHandler(validate(sessionRequest.searchItems)),
    asyncHandler(sessionController.searchItems)
)

/**
 * @swagger
 * /organizer/sessions/active:
 *   get:
 *     summary: Get all active sessions
 *     tags: [Organizer Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
sessionRouter.get('/active', asyncHandler(sessionController.getActiveSessions))

/**
 * @swagger
 * /organizer/sessions/type/{type}:
 *   get:
 *     summary: Get sessions by type
 *     tags: [Organizer Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Session type
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
sessionRouter.get('/type/:type', asyncHandler(sessionController.getByType))

/**
 * @swagger
 * /organizer/sessions/event/{eventId}:
 *   get:
 *     summary: Get all sessions for a specific event
 *     tags: [Organizer Sessions]
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
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event does not belong to organizer
 *       404:
 *         description: Event not found
 */
sessionRouter.get(
    '/event/:eventId',
    asyncHandler(sessionMiddleware.verifyEventOwnership),
    asyncHandler(sessionController.getListByEventId)
)

/**
 * @swagger
 * /organizer/sessions/{id}:
 *   get:
 *     summary: Get a session by ID
 *     tags: [Organizer Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session does not belong to organizer
 *       404:
 *         description: Session not found
 */
sessionRouter.get(
    '/:id',
    asyncHandler(sessionMiddleware.checkSessionId),
    asyncHandler(sessionMiddleware.verifySessionOwnership),
    asyncHandler(sessionController.getItem)
)

/**
 * @swagger
 * /organizer/sessions/{id}:
 *   put:
 *     summary: Update a session
 *     tags: [Organizer Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               place:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               max_waitlist:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               session_type:
 *                 type: string
 *               prerequisites:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session does not belong to organizer
 *       404:
 *         description: Session not found
 */
sessionRouter.put(
    '/:id',
    asyncHandler(requireOrganizerPermission('SESSION:UPDATE', 'SESSION:MANAGE')),
    asyncHandler(sessionMiddleware.checkSessionId),
    asyncHandler(sessionMiddleware.verifySessionOwnership),
    asyncHandler(validate(sessionRequest.updateItem)),
    sessionMiddleware.validateSessionTimeRange,
    asyncHandler(sessionController.updateItem)
)

/**
 * @swagger
 * /organizer/sessions/{id}/properties:
 *   patch:
 *     summary: Update specific properties of a session
 *     tags: [Organizer Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               place:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               max_waitlist:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               session_type:
 *                 type: string
 *               prerequisites:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Session properties updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session does not belong to organizer
 *       404:
 *         description: Session not found
 */
sessionRouter.patch(
    '/:id/properties',
    asyncHandler(sessionMiddleware.checkSessionId),
    asyncHandler(sessionMiddleware.verifySessionOwnership),
    asyncHandler(validate(sessionRequest.updateProperties)),
    sessionMiddleware.validateSessionTimeRange,
    asyncHandler(sessionController.updateProperties)
)

/**
 * @swagger
 * /organizer/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Organizer Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session does not belong to organizer
 *       404:
 *         description: Session not found
 */
sessionRouter.delete(
    '/:id',
    asyncHandler(requireOrganizerPermission('SESSION:DELETE', 'SESSION:MANAGE')),
    asyncHandler(sessionMiddleware.checkSessionId),
    asyncHandler(sessionMiddleware.verifySessionOwnership),
    asyncHandler(sessionController.deleteItem)
)

export default sessionRouter
