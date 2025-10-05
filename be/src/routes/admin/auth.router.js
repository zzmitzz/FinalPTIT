import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/require-authentication'
import validate from '@/app/middleware/common/validate'
import * as authMiddleware from '@/app/middleware/auth.middleware'
import * as authRequest from '@/app/requests/admin/auth.request'
import * as authController from '@/app/controllers/organizer/auth.controller'

const authRouter = Router()

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin user with email and password
 *     tags: [Admin Auth]
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
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 description: Admin password
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
 * /admin/auth/register:
 *   post:
 *     summary: Admin registration
 *     description: Register a new admin user
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 description: Admin password
 *               name:
 *                 type: string
 *                 description: Admin full name
 *               phone:
 *                 type: string
 *                 description: Admin phone number
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
 * /admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     description: Logout admin user and invalidate token
 *     tags: [Admin Auth]
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
    asyncHandler(requireAuthentication),
    asyncHandler(authController.logout)
)

/**
 * @swagger
 * /admin/auth/me:
 *   get:
 *     summary: Get admin profile
 *     description: Get current admin user profile information
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Admin ID
 *                 email:
 *                   type: string
 *                   description: Admin email
 *                 name:
 *                   type: string
 *                   description: Admin name
 *                 phone:
 *                   type: string
 *                   description: Admin phone
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
    asyncHandler(requireAuthentication),
    asyncHandler(authController.me)
)

/**
 * @swagger
 * /admin/auth/me:
 *   put:
 *     summary: Update admin profile
 *     description: Update current admin user profile information
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin full name
 *               phone:
 *                 type: string
 *                 description: Admin phone number
 *     responses:
 *       200:
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
    '/me',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(authController.updateProfile)
)

/**
 * @swagger
 * /admin/auth/change-password:
 *   patch:
 *     summary: Change admin password
 *     description: Change current admin user password
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: Current password
 *               new_password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
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
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.changePassword)),
    asyncHandler(authController.changePassword)
)

/**
 * @swagger
 * /admin/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email to admin
 *     tags: [Admin Auth]
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
 *                 description: Admin email address
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
    authController.forgotPassword,
)

/**
 * @swagger
 * /admin/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     description: Reset admin password using reset token
 *     tags: [Admin Auth]
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
 *       200:
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
    asyncHandler(authController.resetPassword),
)

export default authRouter
