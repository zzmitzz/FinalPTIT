import { Router } from 'express'
import * as deviceController from '@/app/controllers/registrations/device.controller.js'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'

const router = Router()

// All routes require registration authentication
router.use(requireRegistrationAuthentication)

// Register or update device
router.post('/devices', deviceController.registerDevice)

// Get user's devices
router.get('/devices', deviceController.getMyDevices)

// Update device settings
router.put('/devices/:device_id', deviceController.updateDeviceSettings)

// Deactivate device (logout)
router.delete('/devices/:device_id', deviceController.deactivateDevice)

// Get received notifications
router.get('/notifications', deviceController.getReceivedNotifications)

// Mark notification as opened
router.post('/notifications/:notification_id/opened', deviceController.markNotificationOpened)

export default router
