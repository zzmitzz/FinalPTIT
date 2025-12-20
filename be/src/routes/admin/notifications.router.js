import {Router} from 'express'
import * as notificationController from '@/app/controllers/admin/notification.controller.js'
import {verifySystemUserToken} from '@/app/middleware/rbac.middleware'

const router = Router()

// All routes require authentication
router.use(verifySystemUserToken)

// Create notification (draft)
router.post('/', notificationController.createNotification)

// List notifications
router.get('/', notificationController.listNotifications)

// Get notification by ID
router.get('/:id', notificationController.getNotification)

// Update notification (only draft)
router.put('/:id', notificationController.updateNotification)

// Delete notification (only draft)
router.delete('/:id', notificationController.deleteNotification)

// Send notification
router.post('/:id/send', notificationController.sendNotification)

// Get notification statistics
router.get('/:id/stats', notificationController.getNotificationStats)

// Cancel scheduled notification
router.post('/:id/cancel', notificationController.cancelScheduledNotification)

// Reschedule notification
router.post('/:id/reschedule', notificationController.rescheduleNotification)

export default router
