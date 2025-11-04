import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'
import * as authMiddleware from '@/app/middleware/registrations/auth.middleware'
import * as authRequest from '@/app/requests/registrations/auth.request'
import * as authController from '@/app/controllers/registrations/auth.controller'

const authRouter = Router()

/**
 * @swagger
 * /registrations/auth/login:
 *   post:
 *     summary: Registration user login
 *     description: Authenticate registration user with email and password
 *     tags: [Registration Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registration user email address
 *               password:
 *                 type: string
 *                 description: Registration user password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post(
    '/login',
    asyncHandler(validate(authRequest.login)),
    asyncHandler(authController.login)
)

/**
 * @swagger
 * /registrations/auth/register:
 *   post:
 *     summary: Registration user registration
 *     description: Register a new registration user
 *     tags: [Registration Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registration user email address
 *               password:
 *                 type: string
 *                 description: Registration user password
 *               phone:
 *                 type: string
 *                 description: Registration user phone number
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthToken'
 *                 - $ref: '#/components/schemas/Success'
 *       400:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post(
    '/register',
    asyncHandler(validate(authRequest.register)),
    asyncHandler(authController.register)
)

/**
 * @swagger
 * /registrations/auth/logout:
 *   post:
 *     summary: Registration user logout
 *     description: Logout registration user and invalidate token
 *     tags: [Registration Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post(
    '/logout',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(authController.logout)
)

/**
 * @swagger
 * /registrations/auth/me:
 *   get:
 *     summary: Get registration user profile
 *     description: Get current registration user profile information
 *     tags: [Registration Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registration profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Registration ID
 *                 email:
 *                   type: string
 *                   description: Registration email
 *                 phone:
 *                   type: string
 *                   description: Registration phone
 *                 full_name:
 *                   type: string
 *                   description: Full name
 *                 dob:
 *                   type: string
 *                   format: date
 *                   description: Date of birth
 *                 gender:
 *                   type: string
 *                   description: Gender
 *                 address:
 *                   type: string
 *                   description: Address
 *                 bio:
 *                   type: string
 *                   description: Biography
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Account creation date
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.get(
    '/me',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(authController.me)
)

/**
 * @swagger
 * /registrations/auth/update-profile:
 *   put:
 *     summary: Update registration user profile
 *     description: Update current registration user profile information with optional avatar upload
 *     tags: [Registration Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Full name
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPEG, PNG, SVG, or WebP, max 25MB)
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Gender
 *               address:
 *                 type: string
 *                 description: Address
 *               bio:
 *                 type: string
 *                 description: Biography
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Full name
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               avatar_url:
 *                 type: string
 *                 description: Avatar URL (if not uploading file)
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Gender
 *               address:
 *                 type: string
 *                 description: Address
 *               bio:
 *                 type: string
 *                 description: Biography
 *     responses:
 *       201:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.put(
    '/update-profile',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(authController.updateProfile)
)

/**
 * @swagger
 * /registrations/auth/change-password:
 *   patch:
 *     summary: Change registration user password
 *     description: Change current registration user password
 *     tags: [Registration Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - new_password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password
 *               new_password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       201:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid current password
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
authRouter.patch(
    '/change-password',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(validate(authRequest.changePassword)),
    asyncHandler(authController.changePassword)
)

/**
 * @swagger
 * /registrations/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email to registration user
 *     tags: [Registration Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registration user email address
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post(
    '/forgot-password',
    asyncHandler(validate(authRequest.forgotPassword)),
    authController.forgotPassword
)

/**
 * @swagger
 * /registrations/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     description: Reset registration user password using reset token
 *     tags: [Registration Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       201:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post(
    '/reset-password/:token',
    asyncHandler(authMiddleware.verifyForgotPasswordToken),
    asyncHandler(validate(authRequest.resetPassword)),
    asyncHandler(authController.resetPassword)
)

export default authRouter
