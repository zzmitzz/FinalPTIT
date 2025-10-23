import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'
import * as registrationResponseController from '@/app/controllers/registrations/registration-response.controller'
import * as registrationResponseRequest from '@/app/requests/registrations/registration-response.request'

const registrationResponseRouter = Router()

// All routes require authentication
registrationResponseRouter.use(asyncHandler(requireRegistrationAuthentication))

/**
 * @swagger
 * /registrations/responses:
 *   post:
 *     summary: Create a new registration response
 *     tags: [Registration Responses]
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
 *               - form_fields_id
 *             properties:
 *               event_id:
 *                 type: string
 *                 format: uuid
 *               form_fields_id:
 *                 type: string
 *                 format: uuid
 *               response:
 *                 description: Response value (validated based on field type)
 *     responses:
 *       201:
 *         description: Registration response created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Response already exists
 */
registrationResponseRouter.post(
    '/',
    asyncHandler(validate(registrationResponseRequest.createItem)),
    asyncHandler(registrationResponseController.createRegistrationResponse)
)

/**
 * @swagger
 * /registrations/responses:
 *   get:
 *     summary: Get list of registration responses for authenticated user
 *     tags: [Registration Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: event_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: form_fields_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of registration responses
 */
registrationResponseRouter.get(
    '/',
    asyncHandler(validate(registrationResponseRequest.getList)),
    asyncHandler(registrationResponseController.getMyRegistrationResponses)
)

/**
 * @swagger
 * /registrations/responses/submit:
 *   post:
 *     summary: Submit form responses (bulk create for one event)
 *     description: Submit multiple form field responses for a single event in one request. This is used when a user submits a registration form.
 *     tags: [Registration Responses]
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
 *               - responses
 *             properties:
 *               event_id:
 *                 type: string
 *                 format: uuid
 *                 description: The event ID for all responses
 *               responses:
 *                 type: array
 *                 description: Array of form field responses
 *                 items:
 *                   type: object
 *                   required:
 *                     - form_fields_id
 *                   properties:
 *                     form_fields_id:
 *                       type: string
 *                       format: uuid
 *                       description: The form field ID
 *                     response:
 *                       description: Response value (validated based on field type)
 *                       example: "John Doe"
 *             example:
 *               event_id: "123e4567-e89b-12d3-a456-426614174000"
 *               responses:
 *                 - form_fields_id: "123e4567-e89b-12d3-a456-426614174001"
 *                   response: "John Doe"
 *                 - form_fields_id: "123e4567-e89b-12d3-a456-426614174002"
 *                   response: "john@example.com"
 *                 - form_fields_id: "123e4567-e89b-12d3-a456-426614174003"
 *                   response: "+84123456789"
 *     responses:
 *       201:
 *         description: Form submitted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event or form field not found
 */
registrationResponseRouter.post(
    '/submit',
    asyncHandler(validate(registrationResponseRequest.bulkCreate)),
    asyncHandler(registrationResponseController.submitFormResponses)
)

/**
 * @swagger
 * /registrations/responses/{id}:
 *   get:
 *     summary: Get registration response by ID
 *     tags: [Registration Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registration response details
 *       403:
 *         description: Forbidden - response does not belong to user
 *       404:
 *         description: Registration response not found
 */
registrationResponseRouter.get(
    '/:id',
    asyncHandler(registrationResponseController.getRegistrationResponseById)
)

/**
 * @swagger
 * /registrations/responses/{id}:
 *   put:
 *     summary: Update a registration response
 *     tags: [Registration Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_id:
 *                 type: string
 *                 format: uuid
 *               form_fields_id:
 *                 type: string
 *                 format: uuid
 *               response:
 *                 description: Response value (validated based on field type)
 *     responses:
 *       200:
 *         description: Registration response updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - response does not belong to user
 *       404:
 *         description: Registration response not found
 */
registrationResponseRouter.put(
    '/:id',
    asyncHandler(validate(registrationResponseRequest.updateItem)),
    asyncHandler(registrationResponseController.updateRegistrationResponse)
)

export default registrationResponseRouter

