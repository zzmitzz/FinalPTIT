import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as rbacMiddleware from '@/app/middleware/rbac.middleware'
import * as eventService from '@/app/services/organizer/event.service'
import {EVENT_STATUS} from '@/configs/constants'

const router = Router()

// All routes require authentication
router.use(rbacMiddleware.verifySystemUserToken)

// List all events (admin)
router.get(
    '/',
    rbacMiddleware.requirePermission('EVENT:READ', 'EVENT:REVIEW', 'EVENT:MANAGE'),
    rbacMiddleware.requireOrganizerResourceAccess(),
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 20)

        // Filter by allowed organizers
        const allowedOrganizerIds = req.allowedOrganizerIds
        const result = await eventService.listEvents(page, limit, null, false, allowedOrganizerIds)
        res.jsonify(result)
    })
)

// Get event by id
router.get(
    '/:id',
    rbacMiddleware.requirePermission('EVENT:READ', 'EVENT:REVIEW', 'EVENT:MANAGE'),
    asyncHandler(async (req, res) => {
        const event = await eventService.getEventById(req.params.id)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')

        // Validate organizer access
        rbacMiddleware.validateOrganizerAccess(req.currentUser, event.organizer_id)

        res.jsonify(event)
    })
)

// Update event (admin)
router.put(
    '/:id',
    rbacMiddleware.requirePermission('EVENT:UPDATE', 'EVENT:MANAGE'),
    asyncHandler(async (req, res) => {
        // Get event first to check organizer access
        const event = await eventService.getEventById(req.params.id)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')

        // Validate organizer access
        rbacMiddleware.validateOrganizerAccess(req.currentUser, event.organizer_id)

        const updated = await eventService.updateEvent(req.params.id, req.body)
        res.status(201).jsonify('Cập nhật sự kiện thành công.')
    })
)

// Toggle visibility/approve
router.patch(
    '/:id/visibility',
    rbacMiddleware.requirePermission('EVENT:APPROVE', 'EVENT:REVIEW', 'EVENT:MANAGE'),
    asyncHandler(async (req, res) => {
        // Get event first to check organizer access
        const event = await eventService.getEventById(req.params.id)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')

        // Validate organizer access
        rbacMiddleware.validateOrganizerAccess(req.currentUser, event.organizer_id)

        const visible = typeof req.body.visible !== 'undefined' ? !!req.body.visible : true
        const status = visible ? EVENT_STATUS.APPROVED : EVENT_STATUS.WAITING
        const updated = await eventService.updateEvent(req.params.id, {status})
        res.jsonify({message: visible ? 'Mở hiển thị sự kiện.' : 'Khoá sự kiện.'})
    })
)

// Delete event
router.delete(
    '/:id',
    rbacMiddleware.requirePermission('EVENT:DELETE', 'EVENT:MANAGE'),
    asyncHandler(async (req, res) => {
        // Get event first to check organizer access
        const event = await eventService.getEventById(req.params.id)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')

        // Validate organizer access
        rbacMiddleware.validateOrganizerAccess(req.currentUser, event.organizer_id)

        const deleted = await eventService.deleteEvent(req.params.id)
        res.status(204).send()
    })
)

export default router
