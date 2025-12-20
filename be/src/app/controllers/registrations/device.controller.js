import * as userDeviceService from '../../services/user-device.service.js'
import * as notificationService from '../../services/notification.service.js'

/**
 * Register or update device token
 */
export async function registerDevice(req, res, next) {
    try {
        const registrationId = req.user.user_id

        const {device_id, device_type, fcm_token, device_name, os_version, app_version} = req.body

        // Validate required fields
        if (!device_id || !device_type || !fcm_token) {
            return res.status(400).json({
                success: false,
                message: 'device_id, device_type, and fcm_token are required',
            })
        }

        const device = await userDeviceService.registerDevice(registrationId, {
            device_id,
            device_type,
            fcm_token,
            device_name,
            os_version,
            app_version,
        })

        return res.status(200).json({
            success: true,
            message: 'Device registered successfully',
            data: device,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get user's devices
 */
export async function getMyDevices(req, res, next) {
    try {
        const registrationId = req.user.user_id

        const devices = await userDeviceService.getDevicesByRegistration(registrationId)

        return res.status(200).json({
            success: true,
            data: devices,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Update device settings
 */
export async function updateDeviceSettings(req, res, next) {
    try {
        const registrationId = req.user.user_id
        const {device_id} = req.params

        // Verify device belongs to user
        const device = await userDeviceService.getDeviceById(device_id)
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found',
            })
        }

        if (device.registration_id !== registrationId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const {notifications_enabled, device_name} = req.body

        const updated = await userDeviceService.updateDeviceSettings(device_id, {
            notifications_enabled,
            device_name,
        })

        return res.status(200).json({
            success: true,
            message: 'Device settings updated successfully',
            data: updated,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Deactivate device (logout)
 */
export async function deactivateDevice(req, res, next) {
    try {
        const registrationId = req.user.user_id
        const {device_id} = req.params

        // Verify device belongs to user
        const device = await userDeviceService.getDeviceById(device_id)
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found',
            })
        }

        if (device.registration_id !== registrationId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        await userDeviceService.deactivateDevice(device_id)

        return res.status(200).json({
            success: true,
            message: 'Device deactivated successfully',
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get received notifications
 */
export async function getReceivedNotifications(req, res, next) {
    try {
        const registrationId = req.user.user_id

        const {page = 1, limit = 20, status} = req.query

        const filters = {}
        if (status) filters.status = status

        const result = await notificationService.getReceivedNotifications(registrationId, {
            page: parseInt(page),
            limit: parseInt(limit),
            ...filters,
        })

        return res.status(200).json({
            success: true,
            data: result.notifications,
            pagination: result.pagination,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Mark notification as opened
 */
export async function markNotificationOpened(req, res, next) {
    try {
        const registrationId = req.user.user_id
        const {notification_id} = req.params
        const {device_id} = req.body

        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: 'device_id is required',
            })
        }

        // Verify device belongs to user
        const device = await userDeviceService.getDeviceById(device_id)
        if (!device || device.registration_id !== registrationId) {
            return res.status(403).json({
                success: false,
                message: 'Invalid device',
            })
        }

        await notificationService.markNotificationOpened(notification_id, registrationId, device_id)

        return res.status(200).json({
            success: true,
            message: 'Notification marked as opened',
        })
    } catch (error) {
        next(error)
    }
}
