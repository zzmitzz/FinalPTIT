import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizor/require-authentication'
import * as formFieldRequest from '@/app/requests/organizor/form-field.request'
import * as formFieldController from '@/app/controllers/organizor/form-field.controller'
import * as formFieldMiddleware from '@/app/middleware/organizor/form-field.middleware'

const formFieldRouter = Router()

// All routes require authentication
formFieldRouter.use(asyncHandler(requireOrganizerAuthentication))

/**
 * @swagger
 * /organizor/form-fields:
 *   post:
 *     summary: Create a new form field
 *     description: Create a new form field for a specific form
 *     tags: [Form Fields]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - form_id
 *               - field_label
 *               - field_type
 *               - position
 *             properties:
 *               form_id:
 *                 type: string
 *                 description: ID of the form this field belongs to
 *               field_label:
 *                 type: string
 *                 description: Label of the field
 *               field_description:
 *                 type: string
 *                 description: Description of the field
 *               field_type:
 *                 type: string
 *                 enum: [EMAIL, PHONE, FILE, FACE_ID, RADIO, CHECKBOX, TEXT, TEXTAREA, NUMBER, DATE, TIME_MINUTE]
 *                 description: Type of the field
 *               field_options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Options for RADIO or CHECKBOX fields
 *               field_has_other_option:
 *                 type: boolean
 *                 description: Whether the field has an "Other" option
 *               field_range:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     nullable: true
 *                   max:
 *                     type: number
 *                     nullable: true
 *                 description: Range for NUMBER fields
 *               field_extensions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Allowed file extensions for FILE fields
 *               required:
 *                 type: boolean
 *                 description: Whether the field is required
 *               is_primary_key:
 *                 type: boolean
 *                 description: Whether the field is a primary key
 *               can_edit:
 *                 type: boolean
 *                 description: Whether the field can be edited
 *               position:
 *                 type: integer
 *                 description: Position of the field in the form
 *     responses:
 *       201:
 *         description: Form field created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
formFieldRouter.post(
    '/',
    asyncHandler(validate(formFieldRequest.createItem)),
    asyncHandler(formFieldController.createItem)
)

/**
 * @swagger
 * /organizor/form-fields:
 *   get:
 *     summary: Get form fields by form ID
 *     description: Retrieve all form fields for a specific form
 *     tags: [Form Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: form_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the form
 *     responses:
 *       200:
 *         description: List of form fields retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
formFieldRouter.get(
    '/',
    asyncHandler(validate(formFieldRequest.getListByFormId)),
    asyncHandler(formFieldController.getListByFormId)
)

/**
 * @swagger
 * /organizor/form-fields/{id}:
 *   get:
 *     summary: Get a form field by ID
 *     description: Retrieve a specific form field by its ID
 *     tags: [Form Fields]
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
formFieldRouter.get(
    '/:id',
    asyncHandler(formFieldMiddleware.checkFormFieldId),
    asyncHandler(formFieldController.getItem)
)

/**
 * @swagger
 * /organizor/form-fields/{id}:
 *   put:
 *     summary: Update a form field
 *     description: Update a specific form field by its ID
 *     tags: [Form Fields]
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
formFieldRouter.put(
    '/:id',
    asyncHandler(validate(formFieldRequest.updateItem)),
    asyncHandler(formFieldController.updateItem)
)

/**
 * @swagger
 * /organizor/form-fields/{id}:
 *   delete:
 *     summary: Delete a form field
 *     description: Delete a specific form field by its ID
 *     tags: [Form Fields]
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
formFieldRouter.delete(
    '/:id',
    asyncHandler(formFieldController.deleteItem)
)

/**
 * @swagger
 * /organizor/form-fields/form/{formId}:
 *   delete:
 *     summary: Delete all form fields for a form
 *     description: Delete all form fields associated with a specific form
 *     tags: [Form Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form fields deleted successfully
 *       401:
 *         description: Unauthorized
 */
formFieldRouter.delete(
    '/form/:formId',
    asyncHandler(formFieldController.deleteByFormId)
)

export default formFieldRouter

