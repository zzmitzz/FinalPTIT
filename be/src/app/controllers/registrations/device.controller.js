import * as userDeviceService from '../../services/user-device.service.js'
import * as notificationService from '../../services/notification.service.js'

/**
 * Register or update device token
 */
export async function registerDevice(req, res, next) {
    try {
        const registrationId = req.currentRegistration._id

        const { device_id, device_type, fcm_token, device_name, os_version, app_version } = req.body

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

        return res.jsonify(device)
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to register device',
        })
    }
}

/**
 * Get user's devices
 */
export async function getMyDevices(req, res, next) {
    try {
        const registrationId = req.currentRegistration._id

        const devices = await userDeviceService.getDevicesByRegistration(registrationId)

        return res.jsonify(devices)
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to get user devices',
        })
    }
}

/**
 * Update device settings
 */
export async function updateDeviceSettings(req, res, next) {
    try {
        const registrationId = req.currentRegistration._id
        const { device_id } = req.params

        // Verify device belongs to user
        const device = await userDeviceService.getDeviceById(device_id)
        if (!device) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Device not found',
            })
        }

        if (device.registration_id !== registrationId) {
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'Access denied',
            })
        }

        const { notifications_enabled, device_name } = req.body

        const updated = await userDeviceService.updateDeviceSettings(device_id, {
            notifications_enabled,
            device_name,
        })

        return res.jsonify(updated)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to update device settings',
        })
    }
}

/**
 * Deactivate device (logout)
 */
export async function deactivateDevice(req, res, next) {
    try {
        const registrationId = req.currentRegistration._id
        const { device_id } = req.params

        // Verify device belongs to user
        const device = await userDeviceService.getDeviceById(device_id)
        if (!device) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Device not found',
            })
        }

        if (device.registration_id !== registrationId) {
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'Access denied',
            })
        }

        await userDeviceService.deactivateDevice(device_id)

        return res.jsonify({
            success: true,
            message: 'Device deactivated successfully',
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to deactivate device',
        })
    }
}

/**
 * Get received notifications
 */
export async function getReceivedNotifications(req, res, next) {
    try {
        const registrationId = req.currentRegistration._id
        const { device_id } = req.params

        const { page = 1, limit = 20, status } = req.query

        const filters = {}
        if (status) filters.status = status

        const result = await notificationService.getReceivedNotifications(registrationId, device_id, {
            page: parseInt(page),
            limit: parseInt(limit),
            ...filters,
        })
        console.log(result)
        return res.jsonify({
            notifications: result.data,
            pagination: result.pagination,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to get received notifications',
        })
    }
}

/**
 * Mark notification as opened
 */
export async function markNotificationOpened(req, res, next) {
    try {
        const registrationId = req.currentRegistration._id
        const { notification_id } = req.params
        const { device_id } = req.body

        if (!device_id) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'device_id is required',
            })
        }

        // Verify device belongs to user
        const device = await userDeviceService.getDeviceById(device_id)
        if (!device || device.registration_id !== registrationId) {
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'Invalid device',
            })
        }

        await notificationService.markNotificationOpened(notification_id, registrationId, device_id)

        return res.jsonify({
            success: true,
            message: 'Notification marked as opened',
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to mark notification as opened',
        })
    }
}
