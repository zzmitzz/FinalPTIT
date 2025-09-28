import * as formMiddleware from '@/app/middleware/form.middleware'
import * as formController from '@/app/controllers/form.controller'
import { asyncHandler } from '@/utils/helpers'
import { Router } from 'express'

const formRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Form
 *   description: API endpoints for managing forms
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Form:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The form ID
 *         title:
 *           type: string
 *           description: The form title
 *         fields:
 *           type: array
 *           description: List of form fields
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *               required:
 *                 type: boolean
 */

/**
 * @swagger
 * /form/{formId}:
 *   get:
 *     summary: Get form by ID
 *     tags: [Form]
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: The form ID
 *     responses:
 *       200:
 *         description: Form retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       404:
 *         description: Form not found
 */
formRouter.get(
    '/:formId',
    asyncHandler(formMiddleware.verifyFormId),
    asyncHandler(formController.readItem),
)

/**
 * @swagger
 * /form/{formId}:
 *   post:
 *     summary: Submit a form
 *     tags: [Form]
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: The form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Form data (will vary based on the form fields)
 *     responses:
 *       200:
 *         description: Form submitted successfully
 *       400:
 *         description: Invalid form data
 *       404:
 *         description: Form not found
 */
formRouter.post(
    '/:formId',
    asyncHandler(formMiddleware.verifyFormId),
    formMiddleware.canSubmitForm,
    asyncHandler(formMiddleware.validateSubmitFormRequest),
    asyncHandler(formController.submitForm),
)

export default formRouter
