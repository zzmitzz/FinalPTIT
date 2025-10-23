import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import * as eventController from '@/app/controllers/organizer/event.controller'
import * as eventRequest from '@/app/requests/organizer/event.request'
import * as formController from '@/app/controllers/organizer/form.controller'
import * as formRequest from '@/app/requests/organizer/form.request'
import * as formFieldController from '@/app/controllers/organizer/form-field.controller'
import * as formFieldRequest from '@/app/requests/organizer/form-field.request'
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

/**
 * @swagger
 * /organizer/events/forms:
 *   post:
 *     summary: Create a form with fields for an event
 *     description: Create a new form and its associated fields in a single request
 *     tags: [Organizer Events]
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
 *               - fields
 *             properties:
 *               event_id:
 *                 type: string
 *                 description: Event ID
 *               title:
 *                 type: string
 *                 description: Form title
 *               description:
 *                 type: string
 *                 description: Form description
 *               is_public:
 *                 type: boolean
 *                 description: Whether the form is public
 *                 default: false
 *               fields:
 *                 type: array
 *                 description: Array of form fields
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - field_label
 *                     - field_type
 *                     - position
 *                   properties:
 *                     field_label:
 *                       type: string
 *                       description: Field label
 *                     field_description:
 *                       type: string
 *                       description: Field description
 *                     field_type:
 *                       type: string
 *                       enum: [EMAIL, PHONE, FILE, FACE_ID, RADIO, CHECKBOX, TEXT, TEXTAREA, NUMBER, DATE, TIME_MINUTE]
 *                       description: Field type
 *                     field_options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Options for RADIO/CHECKBOX fields
 *                     field_has_other_option:
 *                       type: boolean
 *                       default: false
 *                     field_range:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: number
 *                           nullable: true
 *                         max:
 *                           type: number
 *                           nullable: true
 *                     field_extensions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Allowed file extensions for FILE type
 *                     required:
 *                       type: boolean
 *                       default: false
 *                     is_primary_key:
 *                       type: boolean
 *                       default: false
 *                     can_edit:
 *                       type: boolean
 *                       default: true
 *                     position:
 *                       type: integer
 *                       minimum: 0
 *                       description: Field position/order
 *     responses:
 *       201:
 *         description: Form and fields created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
eventRouter.post(
    '/forms',
    asyncHandler(validate(formRequest.createFormWithFields)),
    asyncHandler(formController.createFormWithFields)
)

/**
 * @swagger
 * /organizer/events/forms/{id}:
 *   get:
 *     summary: Get a form by ID with all its fields
 *     description: Retrieve a form and all associated form fields
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form retrieved successfully with fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
eventRouter.get(
    '/forms/:id',
    asyncHandler(formController.getForm)
)

/**
 * @swagger
 * /organizer/events/forms/{id}:
 *   put:
 *     summary: Update a form
 *     description: Update form metadata (title, description, is_public)
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Form title
 *               description:
 *                 type: string
 *                 description: Form description
 *               is_public:
 *                 type: boolean
 *                 description: Whether the form is public
 *     responses:
 *       200:
 *         description: Form updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
eventRouter.put(
    '/forms/:id',
    asyncHandler(validate(formRequest.updateForm)),
    asyncHandler(formController.updateForm)
)

/**
 * @swagger
 * /organizer/events/forms/{id}:
 *   delete:
 *     summary: Delete a form
 *     description: Delete a form and all its associated fields
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       204:
 *         description: Form deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
eventRouter.delete(
    '/forms/:id',
    asyncHandler(formController.deleteForm)
)

/**
 * @swagger
 * /organizer/events/form-fields/{id}:
 *   get:
 *     summary: Get a form field by ID
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Form field ID
 *     responses:
 *       200:
 *         description: Form field retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form field not found
 */
eventRouter.get(
    '/form-fields/:id',
    asyncHandler(formFieldController.getItem)
)

/**
 * @swagger
 * /organizer/events/form-fields/{id}:
 *   put:
 *     summary: Update a form field
 *     description: Update a form field (only if can_edit is true)
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Form field ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field_label:
 *                 type: string
 *               field_description:
 *                 type: string
 *               field_type:
 *                 type: string
 *                 enum: [EMAIL, PHONE, FILE, FACE_ID, RADIO, CHECKBOX, TEXT, TEXTAREA, NUMBER, DATE, TIME_MINUTE]
 *               field_options:
 *                 type: array
 *                 items:
 *                   type: string
 *               field_has_other_option:
 *                 type: boolean
 *               field_range:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     nullable: true
 *                   max:
 *                     type: number
 *                     nullable: true
 *               field_extensions:
 *                 type: array
 *                 items:
 *                   type: string
 *               required:
 *                 type: boolean
 *               is_primary_key:
 *                 type: boolean
 *               can_edit:
 *                 type: boolean
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Form field updated successfully
 *       400:
 *         description: Invalid input or field cannot be edited
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form field not found
 */
eventRouter.put(
    '/form-fields/:id',
    asyncHandler(validate(formFieldRequest.updateItem)),
    asyncHandler(formFieldController.updateItem)
)

/**
 * @swagger
 * /organizer/events/form-fields/{id}:
 *   delete:
 *     summary: Delete a form field
 *     description: Delete a form field (only if can_edit is true)
 *     tags: [Organizer Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Form field ID
 *     responses:
 *       200:
 *         description: Form field deleted successfully
 *       400:
 *         description: Field cannot be deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form field not found
 */
eventRouter.delete(
    '/form-fields/:id',
    asyncHandler(formFieldController.deleteItem)
)

export default eventRouter
