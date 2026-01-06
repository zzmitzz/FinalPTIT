import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-authentication'
import * as authRequest from '@/app/requests/organizer/auth.request'
import * as organizerRepo from '@/db/organizer_repo'
import {buildStaticUrl} from '@/utils/url-builder'

const userRouter = Router()

/**
 * @swagger
 * /organizer/users:
 *   get:
 *     summary: List all organizers
 *     description: Get paginated list of all organizer users
 *     tags: [Organizer Users]
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
 *         description: List of organizers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Pagination'
 *                 - type: object
 *                   properties:
 *                     organizers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Organizer ID
 *                           email:
 *                             type: string
 *                             description: Organizer email
 *                           name:
 *                             type: string
 *                             description: Organizer name
 *                           phone:
 *                             type: string
 *                             description: Organizer phone
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
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(async function (req, res) {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 20)
        const [items, total] = await Promise.all([
            organizerRepo.findAllOrganizers(page, limit),
            organizerRepo.countOrganizers(),
        ])
        const organizers = (items || []).map((o) => ({...o, avatar: buildStaticUrl(o.avatar)}))
        res.jsonify({total, page, per_page: limit, organizers})
    }),
)

/**
 * @swagger
 * /organizer/users/{id}:
 *   get:
 *     summary: Get organizer by ID
 *     description: Get specific organizer user details by ID
 *     tags: [Organizer Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organizer ID
 *     responses:
 *       200:
 *         description: Organizer details retrieved successfully
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
 *       404:
 *         description: Organizer not found
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
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(async function (req, res) {
        const organizer = await organizerRepo.findOrganizerById(req.params.id)
        if (!organizer) return res.status(404).jsonify('Không tìm thấy ban tổ chức.')
        res.jsonify({...organizer, avatar: buildStaticUrl(organizer.avatar)})
    }),
)

/**
 * @swagger
 * /organizer/users/{id}:
 *   put:
 *     summary: Update organizer profile
 *     description: Update organizer user information by ID
 *     tags: [Organizer Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organizer ID
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
 *         description: Organizer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Organizer not found
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
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(async function (req, res) {
        const updated = await organizerRepo.updateOrganizerById(req.params.id, req.body)
        if (!updated) return res.status(404).jsonify('Không tìm thấy ban tổ chức.')
        res.status(201).jsonify('Cập nhật thông tin ban tổ chức thành công.')
    }),
)

/**
 * @swagger
 * /organizer/users/{id}/reset-password:
 *   patch:
 *     summary: Reset organizer password
 *     description: Set a new password for organizer user by ID
 *     tags: [Organizer Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organizer ID
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
 *         description: Organizer not found
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
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(authRequest.resetPassword)),
    asyncHandler(async function (req, res) {
        const bcrypt = (await import('bcrypt')).default
        const passwordHash = await bcrypt.hash(req.body.new_password, 10)
        const updated = await organizerRepo.updateOrganizerById(req.params.id, {password: passwordHash})
        if (!updated) return res.status(404).jsonify('Không tìm thấy ban tổ chức.')
        res.status(201).jsonify('Cập nhật mật khẩu ban tổ chức thành công.')
    }),
)

export default userRouter
