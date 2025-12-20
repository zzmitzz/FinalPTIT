import UserDevice from '@/model/user_device'
import Registration from '@/model/registration'
import {Op} from 'sequelize'

/**
 * Create or update user device FCM token
 */
export const upsertDevice = async (registrationId, deviceData) => {
    const {fcm_token, device_type, device_id, device_name, app_version, os_version} = deviceData

    try {
        // If device_id exists, try to find and update
        if (device_id) {
            const existingDevice = await UserDevice.findOne({
                where: {
                    registration_id: registrationId,
                    device_id,
                },
            })

            if (existingDevice) {
                await existingDevice.update({
                    fcm_token,
                    device_type,
                    device_name,
                    app_version,
                    os_version,
                    is_active: true,
                    last_used_at: new Date(),
                })
                return existingDevice.toJSON()
            }
        }

        // Create new device
        const device = await UserDevice.create({
            registration_id: registrationId,
            fcm_token,
            device_type,
            device_id,
            device_name,
            app_version,
            os_version,
            is_active: true,
            last_used_at: new Date(),
        })

        return device.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to upsert device: ${errorMsg}`)
    }
}

/**
 * Find device by ID
 */
export const findDeviceById = async (deviceId) => {
    try {
        const device = await UserDevice.findByPk(deviceId)
        return device?.toJSON() || null
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find device: ${errorMsg}`)
    }
}

/**
 * Find all devices for a registration
 */
export const findDevicesByRegistration = async (registrationId) => {
    try {
        const devices = await UserDevice.findAll({
            where: {
                registration_id: registrationId,
                is_active: true,
            },
            order: [['last_used_at', 'DESC']],
        })
        return devices.map((d) => d.toJSON())
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find devices: ${errorMsg}`)
    }
}

/**
 * Deactivate device
 */
export const deactivateDevice = async (deviceId) => {
    try {
        const device = await UserDevice.findByPk(deviceId)
        if (!device) {
            throw new Error('Device not found')
        }

        await device.update({is_active: false})
        return device.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to deactivate device: ${errorMsg}`)
    }
}

/**
 * Get active devices for users registered to an event
 */
export const getDevicesForEvent = async (eventId) => {
    try {
        const devices = await UserDevice.findAll({
            include: [
                {
                    model: Registration,
                    as: 'registration',
                    required: true,
                    include: [
                        {
                            association: 'registration_register_events',
                            where: {event_id: eventId},
                            required: true,
                            attributes: [],
                        },
                    ],
                },
            ],
            where: {
                is_active: true,
                notifications_enabled: true,
            },
        })

        return devices.map((d) => d.toJSON())
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get devices for event: ${errorMsg}`)
    }
}

/**
 * Get all active devices (for global notifications)
 */
export const getAllActiveDevices = async () => {
    try {
        const devices = await UserDevice.findAll({
            where: {
                is_active: true,
                notifications_enabled: true,
            },
            include: [
                {
                    model: Registration,
                    as: 'registration',
                    attributes: ['_id', 'email', 'full_name'],
                },
            ],
        })

        return devices.map((d) => d.toJSON())
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get all active devices: ${errorMsg}`)
    }
}

/**
 * Update device last used timestamp
 */
export const updateDeviceLastUsed = async (deviceId) => {
    try {
        await UserDevice.update({last_used_at: new Date()}, {where: {_id: deviceId}})
    } catch (error) {
        // Silent fail - not critical
        console.error('Failed to update device last used:', error)
    }
}

/**
 * Clean up inactive devices (older than 90 days)
 */
export const cleanupInactiveDevices = async () => {
    try {
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const result = await UserDevice.update(
            {is_active: false},
            {
                where: {
                    last_used_at: {
                        [Op.lt]: ninetyDaysAgo,
                    },
                    is_active: true,
                },
            }
        )

        return result[0] // Number of affected rows
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to cleanup devices: ${errorMsg}`)
    }
}
