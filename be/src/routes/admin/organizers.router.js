import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/require-authentication'
import * as organizerRepo from '@/db/organizer_repo'

const router = Router()

// List organizers (supports q search, page, limit)
router.get(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 20)
        const q = req.query.q ? String(req.query.q).trim() : ''

        const [items, total] = await Promise.all([
            q ? organizerRepo.searchOrganizers(q, page, limit) : organizerRepo.findAllOrganizers(page, limit),
            organizerRepo.countOrganizers(),
        ])

        res.jsonify({ total, page, per_page: limit, organizers: items })
    }),
)

// Get organizer by id
router.get(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const organizer = await organizerRepo.findOrganizerById(req.params.id)
        if (!organizer) return res.status(404).jsonify('Không tìm thấy tổ chức.')
        res.jsonify(organizer)
    }),
)

// Create organizer
router.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const { name, email, phone, password, avatar } = req.body || {}
        if (!name || !email || !phone || !password) {
            return res.status(400).jsonify('Thiếu trường bắt buộc: name, email, phone, password')
        }

        const bcrypt = (await import('bcrypt')).default
        const passwordHash = await bcrypt.hash(String(password), 10)

        const created = await organizerRepo.createOrganizer({ name, email, phone, password: passwordHash, avatar })
        res.status(201).jsonify({ message: 'Tạo tài khoản tổ chức thành công.', organizer: created })
    }),
)

// Update organizer
router.put(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const id = req.params.id
        const updateData = { ...(req.body || {}) }
        if (updateData.password) {
            const bcrypt = (await import('bcrypt')).default
            updateData.password = await bcrypt.hash(String(updateData.password), 10)
        }

        const updated = await organizerRepo.updateOrganizerById(id, updateData)
        if (!updated) return res.status(404).jsonify('Không tìm thấy tổ chức.')
        res.status(201).jsonify({ message: 'Cập nhật tổ chức thành công.', organizer: updated })
    }),
)

// Disable / enable organizer (soft toggle)
router.patch(
    '/:id/disable',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const id = req.params.id
        // expect body: { disabled: true } meaning set is_active = !disabled
        const disabled = req.body && typeof req.body.disabled !== 'undefined' ? !!req.body.disabled : true
        const is_active = !disabled

        const updated = await organizerRepo.updateOrganizerById(id, { is_active })
        if (!updated) return res.status(404).jsonify('Không tìm thấy tổ chức.')
        res.status(200).jsonify({ message: is_active ? 'Kích hoạt tổ chức thành công.' : 'Vô hiệu hoá tổ chức thành công.', organizer: updated })
    }),
)

export default router
