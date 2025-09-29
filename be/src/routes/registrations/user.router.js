import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'
import * as registrationRepo from '@/db/registration_repository'

const userRouter = Router()

/**
 * @swagger
 * /registrations/users:
 *   get:
 *     summary: List all registrations
 *     description: Get paginated list of all registration users
 *     tags: [Registration Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of registrations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Pagination'
 *                 - type: object
 *                   properties:
 *                     registrations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Registration ID
 *                           email:
 *                             type: string
 *                             description: Registration email
 *                           phone:
 *                             type: string
 *                             description: Registration phone
 *                           provider_name:
 *                             type: string
 *                             description: Provider name
 *                           provider_user_id:
 *                             type: string
 *                             description: Provider user ID
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Account creation date
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
userRouter.get(
    '/',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(async function (req, res) {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 20)
        const [items, total] = await Promise.all([
            registrationRepo.findAllRegistrations(page, limit),
            registrationRepo.countRegistrations(),
        ])
        res.jsonify({total, page, per_page: limit, registrations: items})
    }),
)

/**
 * @swagger
 * /registrations/users/{id}:
 *   get:
 *     summary: Get registration by ID
 *     description: Get specific registration user details by ID
 *     tags: [Registration Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration details retrieved successfully
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
 *                 provider_name:
 *                   type: string
 *                   description: Provider name
 *                 provider_user_id:
 *                   type: string
 *                   description: Provider user ID
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Account creation date
 *       404:
 *         description: Registration not found
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
userRouter.get(
    '/:id',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(async function (req, res) {
        const user = await registrationRepo.findRegistrationById(req.params.id)
        if (!user) return res.status(404).jsonify('Không tìm thấy người đăng ký.')
        res.jsonify(user)
    }),
)

/**
 * @swagger
 * /registrations/users/{id}:
 *   put:
 *     summary: Update registration profile
 *     description: Update registration user information by ID
 *     tags: [Registration Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registration email address
 *               phone:
 *                 type: string
 *                 description: Registration phone number
 *               provider_name:
 *                 type: string
 *                 description: Provider name
 *               provider_user_id:
 *                 type: string
 *                 description: Provider user ID
 *     responses:
 *       201:
 *         description: Registration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Registration not found
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
userRouter.put(
    '/:id',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(async function (req, res) {
        const {email, phone, provider_name, provider_user_id} = req.body
        const updated = await registrationRepo.updateRegistrationById(req.params.id, {
            email,
            phone,
            provider_name,
            provider_user_id,
        })
        if (!updated) return res.status(404).jsonify('Không tìm thấy người đăng ký.')
        res.status(201).jsonify('Cập nhật thông tin người đăng ký thành công.')
    }),
)

/**
 * @swagger
 * /registrations/users/{id}/reset-password:
 *   patch:
 *     summary: Reset registration password
 *     description: Set a new password for registration user by ID
 *     tags: [Registration Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
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
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Registration not found
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
userRouter.patch(
    '/:id/reset-password',
    asyncHandler(requireRegistrationAuthentication),
    asyncHandler(async function (req, res) {
        const bcrypt = (await import('bcrypt')).default
        const passwordHash = await bcrypt.hash(req.body.new_password, 10)
        const updated = await registrationRepo.updateRegistrationById(req.params.id, {password: passwordHash})
        if (!updated) return res.status(404).jsonify('Không tìm thấy người đăng ký.')
        res.status(201).jsonify('Cập nhật mật khẩu người đăng ký thành công.')
    }),
)

export default userRouter
