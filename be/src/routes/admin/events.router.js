import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/require-authentication'
import * as eventService from '@/app/services/organizer/event.service'
import { EVENT_STATUS } from '@/configs/constants'

const router = Router()

// List all events (admin)
router.get(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 20)
        // Admins see all events regardless of status
        const result = await eventService.listEvents(page, limit, null, false)
        res.jsonify(result)
    }),
)

// Get event by id
router.get(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const event = await eventService.getEventById(req.params.id)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        res.jsonify(event)
    }),
)

// Update event (admin)
router.put(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const updated = await eventService.updateEvent(req.params.id, req.body)
        if (!updated) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        res.status(201).jsonify('Cập nhật sự kiện thành công.')
    }),
)

// Toggle visibility/approve
router.patch(
    '/:id/visibility',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const visible = typeof req.body.visible !== 'undefined' ? !!req.body.visible : true
        const status = visible ? EVENT_STATUS.APPROVED : EVENT_STATUS.WAITING
        const updated = await eventService.updateEvent(req.params.id, { status })
        if (!updated) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        res.jsonify({ message: visible ? 'Mở hiển thị sự kiện.' : 'Khoá sự kiện.' })
    }),
)

// Delete event
router.delete(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(async (req, res) => {
        const deleted = await eventService.deleteEvent(req.params.id)
        if (!deleted) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        res.status(204).send()
    }),
)

export default router
