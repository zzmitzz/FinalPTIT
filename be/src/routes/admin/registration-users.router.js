import {Router} from 'express'
import bcrypt from 'bcrypt'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireAuthentication from '@/app/middleware/common/require-authentication'
import * as registrationRepo from '@/db/registration_repository'
import * as registrationUserRequest from '@/app/requests/admin/registration-user.request'

const router = Router()

/**
 * Admin endpoints for regular app users ("registration users").
 * These users live in the `registrations` table and are normally created via the registration flow.
 */

router.get(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(async function (req, res) {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 50)
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''

        const [items, total] = await Promise.all([
            search
                ? registrationRepo.searchRegistrations(search, page, limit)
                : registrationRepo.findAllRegistrations(page, limit),
            registrationRepo.countRegistrations(),
        ])

        res.jsonify({total, page, per_page: limit, registrations: items})
    })
)

router.get(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(async function (req, res) {
        const user = await registrationRepo.findRegistrationById(req.params.id)
        if (!user) return res.status(404).jsonify('Không tìm thấy người dùng.')
        const {password, ...safeUser} = user
        res.jsonify(safeUser)
    })
)

router.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(registrationUserRequest.create)),
    asyncHandler(async function (req, res) {
        const {email, full_name, phone = '', password, is_active} = req.body
        const passwordHash = await bcrypt.hash(password, 10)

        const created = await registrationRepo.createRegistration({
            email,
            full_name,
            phone,
            password: passwordHash,
            // Admin-created users should be active by default.
            is_active: typeof is_active === 'boolean' ? is_active : true,
        })

        const {password: _pw, ...safeUser} = created
        res.status(201).jsonify(safeUser, 'Tạo người dùng thành công.')
    })
)

export default router
