import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireAuthentication from '@/app/middleware/common/require-authentication'
import * as authRequest from '@/app/requests/admin/auth.request'
import * as adminRepository from '@/db/admin_reporistory'

const router = Router()

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all admins
 *     description: Get paginated list of all admin users
 *     tags: [Admin Users]
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
 *         description: List of admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Pagination'
 *                 - type: object
 *                   properties:
 *                     admins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Admin ID
 *                           email:
 *                             type: string
 *                             description: Admin email
 *                           name:
 *                             type: string
 *                             description: Admin name
 *                           phone:
 *                             type: string
 *                             description: Admin phone
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
router.get(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(async function (req, res) {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 20)
        const [items, total] = await Promise.all([
            adminRepository.findAllAdmins(page, limit),
            adminRepository.countAdmins(),
        ])
        res.jsonify({total, page, per_page: limit, admins: items})
    }),
)

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get admin by ID
 *     description: Get specific admin user details by ID
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin details retrieved successfully
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
 *       404:
 *         description: Admin not found
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
router.get(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(async function (req, res) {
        const admin = await adminRepository.findAdminById(req.params.id)
        if (!admin) {
            return res.status(404).jsonify('Không tìm thấy quản trị viên.')
        }
        res.jsonify(admin)
    }),
)

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update admin profile
 *     description: Update admin user information by ID
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
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
 *       201:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Admin not found
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
router.put(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.updateProfile)),
    asyncHandler(async function (req, res) {
        const updated = await adminRepository.updateAdminById(req.params.id, req.body)
        if (!updated) {
            return res.status(404).jsonify('Không tìm thấy quản trị viên.')
        }
        res.status(201).jsonify('Cập nhật thông tin quản trị viên thành công.')
    }),
)

/**
 * @swagger
 * /admin/users/{id}/reset-password:
 *   patch:
 *     summary: Reset admin password
 *     description: Set a new password for admin user by ID
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
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
 *         description: Admin not found
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
router.patch(
    '/:id/reset-password',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(authRequest.resetPassword)),
    asyncHandler(async function (req, res) {
        const bcrypt = (await import('bcrypt')).default
        const passwordHash = await bcrypt.hash(req.body.new_password, 10)
        const updated = await adminRepository.updateAdminById(req.params.id, {password: passwordHash})
        if (!updated) {
            return res.status(404).jsonify('Không tìm thấy quản trị viên.')
        }
        res.status(201).jsonify('Cập nhật mật khẩu quản trị viên thành công.')
    }),
)

export default router
