import * as registrationMiddleware from '@/app/middleware/registration.middleware'
import * as registrationController from '@/app/controllers/registration.controller'
import { asyncHandler } from '@/utils/helpers'
import { Router } from 'express'

const registrationRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Registration
 *   description: API endpoints for managing event registrations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The registration ID
 *         eventId:
 *           type: string
 *           description: The event ID this registration belongs to
 *         attendee:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Attendee name
 *             email:
 *               type: string
 *               description: Attendee email
 */

/**
 * @swagger
 * /registration/{registrationId}/generate-qr:
 *   get:
 *     summary: Generate QR code for a registration
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The registration ID
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Registration not found
 */
registrationRouter.get(
    '/:registrationId/generate-qr',
    asyncHandler(registrationMiddleware.verifyRegistrationId),
    asyncHandler(registrationController.generateQrRegistrations)
)

export default registrationRouter
