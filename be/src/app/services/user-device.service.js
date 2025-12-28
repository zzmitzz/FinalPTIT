import * as userDeviceRepository from '../../db/user_device_repository.js'

/**
 * Register or update device token
 */
export async function registerDevice(registrationId, deviceData) {
    const { device_id, device_type, fcm_token, device_name, os_version, app_version } = deviceData

    // Validate required fields
    if (!device_id) {
        throw new Error('device_id is required')
    }
    if (!device_type) {
        throw new Error('device_type is required')
    }
    if (!fcm_token) {
        throw new Error('fcm_token is required')
    }

    // Validate device_type
    const validTypes = ['ios', 'android', 'web']
    if (!validTypes.includes(device_type)) {
        throw new Error(`device_type must be one of: ${validTypes.join(', ')}`)
    }

    // Upsert device
    const device = await userDeviceRepository.upsertDevice(registrationId, {
        device_id,
        device_type,
        fcm_token,
        device_name: device_name || null,
        os_version: os_version || null,
        app_version: app_version || null,
        is_active: true,
        notifications_enabled: true,
        last_used_at: new Date(),
    })

    return device
}

/**
 * Get device by ID
 */
export async function getDeviceById(deviceId) {
    return await userDeviceRepository.findDeviceById(deviceId)
}

/**
 * Get all devices for a registration
 */
export async function getDevicesByRegistration(registrationId) {
    return await userDeviceRepository.findDevicesByRegistration(registrationId)
}

/**
 * Update device settings
 */
export async function updateDeviceSettings(deviceId, settings) {
    const device = await userDeviceRepository.findDeviceById(deviceId)
    if (!device) {
        throw new Error('Device not found')
    }

    const updates = {}
    if (typeof settings.notifications_enabled === 'boolean') {
        updates.notifications_enabled = settings.notifications_enabled
    }
    if (settings.device_name) {
        updates.device_name = settings.device_name
    }

    if (Object.keys(updates).length === 0) {
        return device
    }

    return await userDeviceRepository.updateDevice(deviceId, updates)
}

/**
 * Deactivate device (on logout)
 */
export async function deactivateDevice(deviceId) {
    return await userDeviceRepository.deactivateDevice(deviceId)
}

/**
 * Update device last used timestamp
 */
export async function updateDeviceLastUsed(deviceId) {
    return await userDeviceRepository.updateDeviceLastUsed(deviceId)
}

/**
 * Clean up inactive devices (older than 90 days)
 */
export async function cleanupInactiveDevices() {
    return await userDeviceRepository.cleanupInactiveDevices()
}
