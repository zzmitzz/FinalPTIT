import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as notificationController from '@/app/controllers/organizer/notification.controller.js'
import requireOrganizerAuthentication, {
    requireOrganizerPermission,
} from '@/app/middleware/organizer/require-authentication'

const router = Router()

// All routes require organizer authentication
router.use(requireOrganizerAuthentication)

// Create notification (draft, scheduled, or recurring)
router.post(
    '/',
    asyncHandler(requireOrganizerPermission('NOTIFICATION:CREATE', 'NOTIFICATION:MANAGE')),
    notificationController.createNotification
)

// List notifications (organizer's own)
router.get(
    '/',
    asyncHandler(requireOrganizerPermission('NOTIFICATION:READ', 'NOTIFICATION:MANAGE')),
    notificationController.listNotifications
)

// Get notification by ID (organizer's own)
router.get(
    '/:id',
    asyncHandler(requireOrganizerPermission('NOTIFICATION:READ', 'NOTIFICATION:MANAGE')),
    notificationController.getNotification
)

// Update notification (only draft and organizer's own)
router.put('/:id', notificationController.updateNotification)

// Delete notification (only draft and organizer's own)
router.delete('/:id', notificationController.deleteNotification)

// Send notification (organizer's own)
router.post('/:id/send', notificationController.sendNotification)

// Get notification statistics (organizer's own)
router.get('/:id/stats', notificationController.getNotificationStats)

// Cancel scheduled notification
router.post('/:id/cancel', notificationController.cancelScheduledNotification)

// Reschedule notification
router.post('/:id/reschedule', notificationController.rescheduleNotification)

// Pause recurring notification
router.post('/:id/pause', notificationController.pauseRecurringNotification)

// Resume recurring notification
router.post('/:id/resume', notificationController.resumeRecurringNotification)

// Validate cron pattern and get human-readable description
router.post('/cron/validate', notificationController.validateCronPattern)

// Get common cron patterns
router.get('/cron/patterns', notificationController.getCommonCronPatterns)

export default router
