import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-authentication'
import * as resourceRequest from '@/app/requests/organizer/resource.request'
import * as resourceController from '@/app/controllers/organizer/resource.controller'
import * as resourceMiddleware from '@/app/middleware/organizer/resource.middleware'

const resourceRouter = Router()

// All routes require authentication
resourceRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * /organizer/resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Organizer Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resource_type
 *               - name
 *             properties:
 *               event_id:
 *                 type: string
 *                 format: uuid
 *                 description: Event ID (required if session_id not provided)
 *               session_id:
 *                 type: integer
 *                 description: Session ID (required if event_id not provided)
 *               resource_type:
 *                 type: string
 *                 enum: [MAPS, FILE]
 *                 description: Type of resource
 *               name:
 *                 type: string
 *                 description: Resource name (must be unique within event/session)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (required for FILE type, max 10MB)
 *               url_source:
 *                 type: string
 *                 format: uri
 *                 description: URL source (required for MAPS type)
 *               description:
 *                 type: string
 *                 description: Resource description
 *               is_public:
 *                 type: boolean
 *                 default: true
 *                 description: Whether resource is publicly accessible
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Whether resource is active
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for categorization
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       400:
 *         description: Invalid input or file too large
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event/Session does not belong to organizer
 *       404:
 *         description: Event or Session not found
 */
resourceRouter.post(
    '/',
    asyncHandler(resourceMiddleware.verifyOwnershipForCreate),
    asyncHandler(validate(resourceRequest.createItem)),
    asyncHandler(resourceController.createItem)
)

/**
 * @swagger
 * /organizer/resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Organizer Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Resource does not belong to organizer
 *       404:
 *         description: Resource not found
 */
resourceRouter.get(
    '/:id',
    asyncHandler(resourceMiddleware.verifyResourceId),
    asyncHandler(resourceMiddleware.verifyResourceOwnership),
    asyncHandler(resourceController.getItem)
)

/**
 * @swagger
 * /organizer/resources/{id}:
 *   put:
 *     summary: Update a resource
 *     tags: [Organizer Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resource_type:
 *                 type: string
 *                 enum: [MAPS, FILE]
 *               name:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New file (max 10MB)
 *               url_source:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               is_public:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Resource not found
 */
resourceRouter.put(
    '/:id',
    asyncHandler(resourceMiddleware.verifyResourceId),
    asyncHandler(resourceMiddleware.verifyResourceOwnership),
    asyncHandler(validate(resourceRequest.updateItem)),
    asyncHandler(resourceController.updateItem)
)

/**
 * @swagger
 * /organizer/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Organizer Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Resource not found
 */
resourceRouter.delete(
    '/:id',
    asyncHandler(resourceMiddleware.verifyResourceId),
    asyncHandler(resourceMiddleware.verifyResourceOwnership),
    asyncHandler(resourceController.deleteItem)
)

/**
 * @swagger
 * /organizer/resources/event/{eventId}:
 *   get:
 *     summary: Get all resources for a specific event
 *     tags: [Organizer Resources]
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
 *         description: Resources retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event does not belong to organizer
 *       404:
 *         description: Event not found
 */
resourceRouter.get(
    '/event/:eventId',
    asyncHandler(resourceMiddleware.verifyEventOwnership),
    asyncHandler(resourceController.getListByEventId)
)

/**
 * @swagger
 * /organizer/resources/session/{sessionId}:
 *   get:
 *     summary: Get all resources for a specific session
 *     tags: [Organizer Resources]
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
 *         description: Resources retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Session does not belong to organizer
 *       404:
 *         description: Session not found
 */
resourceRouter.get(
    '/session/:sessionId',
    asyncHandler(resourceMiddleware.verifySessionOwnership),
    asyncHandler(resourceController.getListBySessionId)
)

/**
 * @swagger
 * /organizer/resources/{id}/check-activation:
 *   get:
 *     summary: Check if a resource is active and visible
 *     tags: [Organizer Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Activation status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                 is_active:
 *                   type: boolean
 *                 is_visible:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
resourceRouter.get(
    '/:id/check-activation',
    asyncHandler(resourceController.checkActivation)
)

export default resourceRouter

