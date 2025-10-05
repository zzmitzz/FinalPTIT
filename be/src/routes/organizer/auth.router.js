import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-authentication'
import * as organizerAuthService from '@/app/services/organizer/organizer_auth.service'
import * as authRequest from '@/app/requests/organizer/auth.request'
import * as authController from '@/app/controllers/organizer/auth.controller'
const authRouter = Router()

/**
 * @swagger
 * /organizer/auth/login:
 *   post:
 *     summary: Organizer login
 *     description: Authenticate organizer user with email and password
 *     tags: [Organizer Auth]
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
 *                 description: Organizer email address
 *               password:
 *                 type: string
 *                 description: Organizer password
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
 * /organizer/auth/register:
 *   post:
 *     summary: Organizer registration
 *     description: Register a new organizer user
 *     tags: [Organizer Auth]
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
 *                 description: Organizer email address
 *               password:
 *                 type: string
 *                 description: Organizer password
 *               name:
 *                 type: string
 *                 description: Organizer full name
 *               phone:
 *                 type: string
 *                 description: Organizer phone number
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
 * /organizer/auth/me:
 *   get:
 *     summary: Get organizer profile
 *     description: Get current organizer user profile information
 *     tags: [Organizer Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Organizer ID
 *                 email:
 *                   type: string
 *                   description: Organizer email
 *                 name:
 *                   type: string
 *                   description: Organizer name
 *                 phone:
 *                   type: string
 *                   description: Organizer phone
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
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(async function (req, res) {
        const profile = await organizerAuthService.profile(req.currentOrganizer._id)
        res.jsonify(profile)
    })
)

/**
 * @swagger
 * /organizer/auth/me:
 *   put:
 *     summary: Update organizer profile
 *     description: Update current organizer user profile information
 *     tags: [Organizer Auth]
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
 *                 description: Organizer full name
 *               phone:
 *                 type: string
 *                 description: Organizer phone number
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
    '/me',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(async function (req, res) {
        await organizerAuthService.updateProfile(req.currentOrganizer, req.body)
        res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
    })
)

/**
 * @swagger
 * /organizer/auth/change-password:
 *   patch:
 *     summary: Change organizer password
 *     description: Change current organizer user password
 *     tags: [Organizer Auth]
 *     security:
 *       - bearerAuth: []
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
 *         description: Password changed successfully
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
authRouter.patch(
    '/change-password',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(authRequest.changePassword)),
    asyncHandler(async function (req, res) {
        await organizerAuthService.resetPassword(req.currentOrganizer._id, req.body.new_password)
        res.status(201).jsonify('Cập nhật mật khẩu thành công.')
    })
)

export default authRouter
