import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import * as eventController from '@/app/controllers/organizer/event.controller'
import * as eventRequest from '@/app/requests/organizer/event.request'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-authentication'

const eventRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Organizer Events
 *   description: Organizer event management
 */

// All routes require organizer authentication
eventRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * /organizer/events:
 *   post:
 *     summary: Create a new event
 *     description: Create an event with metadata and upload images. Uses multipart/form-data. Validate image/file fields with Joi (see event.request.js).
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - thumbnail
 *               - start_time
 *               - end_time
 *               - location
 *               - lat
 *               - lng
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               category_id:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Event thumbnail image file
 *               logo:
 *                 type: array
 *                 description: Optional event logo images
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
eventRouter.post(
    '/',
    asyncHandler(validate(eventRequest.createItem)),
    asyncHandler(eventController.createEvent)
)

/**
 * @swagger
 * /organizer/events:
 *   get:
 *     summary: List events with pagination
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page size (default 10)
 *     responses:
 *       200:
 *         description: List of events with pagination metadata
 *       401:
 *         description: Unauthorized
 */
 eventRouter.get(
     '/',
     asyncHandler(eventController.listEvents)
 )

/**
 * @swagger
 * /organizer/events/search:
 *   get:
 *     summary: Search events by name/description with pagination
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page size (default 10)
 *     responses:
 *       200:
 *         description: List of matching events with pagination metadata
 *       401:
 *         description: Unauthorized
 */
 eventRouter.get(
     '/search',
     asyncHandler(eventController.searchEvents)
 )

/**
 * @swagger
 * /organizer/events/nearby:
 *   get:
 *     summary: Get the 5 nearest events to the provided coordinates
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of events to return (default 5)
 *     responses:
 *       200:
 *         description: Nearest events
 *       400:
 *         description: Missing or invalid lat/lng
 *       401:
 *         description: Unauthorized
 */
 eventRouter.get(
     '/nearby',
     asyncHandler(eventController.getNearbyEvents)
 )

/**
 * @swagger
 * /organizer/events/pin/{pinCode}:
 *   get:
 *     summary: Get event by PIN code
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pinCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 6-digit PIN code
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/pin/:pinCode',
    asyncHandler(eventController.getEventByPinCode)
)


/**
 * @swagger
 * /organizer/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.get(
    '/:id',
    asyncHandler(eventController.getEventById)
)

/**
 * @swagger
 * /organizer/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 description: Thumbnail URL/path
 *               logo:
 *                 type: string
 *                 description: Logo URL/path
 *               description:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               category_id:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *               pin_code:
 *                 type: string
 *               approver_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.put(
    '/:id',
    asyncHandler(validate(eventRequest.updateItem)),
    asyncHandler(eventController.updateEvent)
)

/**
 * @swagger
 * /organizer/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.delete(
    '/:id',
    asyncHandler(eventController.deleteEvent)
)

export default eventRouter
