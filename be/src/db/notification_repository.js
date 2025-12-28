import Notification from '@/model/notification'
import NotificationRecipient from '@/model/notification_recipient'
import SystemUser from '@/model/system_user'
import Organizer from '@/model/organizer'
import Event from '@/model/event'
import Registration from '@/model/registration'
import { Op } from 'sequelize'
import UserDevice from '@/model/user_device'

/**
 * Create notification
 */
export const createNotification = async (notificationData) => {
    try {
        const notification = await Notification.create(notificationData)
        return notification.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create notification: ${errorMsg}`)
    }
}

/**
 * Find notification by ID
 */
export const findNotificationById = async (notificationId, options = {}) => {
    const { includeRecipients = false, includeSender = false, includeTarget = false } = options

    try {
        const include = []

        if (includeSender) {
            include.push(
                {
                    model: SystemUser,
                    as: 'systemUser',
                    attributes: ['_id', 'name', 'email'],
                },
                {
                    model: Organizer,
                    as: 'organizer',
                    attributes: ['_id', 'name', 'email'],
                }
            )
        }

        if (includeTarget) {
            include.push(
                {
                    model: Event,
                    as: 'targetEvent',
                    attributes: ['_id', 'name', 'event_start_date'],
                },
                {
                    model: Organizer,
                    as: 'targetOrganizer',
                    attributes: ['_id', 'name'],
                }
            )
        }

        if (includeRecipients) {
            include.push({
                model: NotificationRecipient,
                as: 'recipients',
                include: [
                    {
                        model: Registration,
                        as: 'registration',
                        attributes: ['_id', 'email', 'full_name'],
                    },
                ],
            })
        }

        const notification = await Notification.findByPk(notificationId, { include })
        return notification?.toJSON() || null
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find notification: ${errorMsg}`)
    }
}

/**
 * Find all notifications with filters
 */
export const findAllNotifications = async (filters = {}) => {
    const { page = 1, limit = 10, sender_type, system_user_id, organizer_id, status, scope } = filters

    try {
        const offset = (page - 1) * limit
        const whereConditions = {}

        if (sender_type) whereConditions.sender_type = sender_type
        if (system_user_id) whereConditions.system_user_id = system_user_id
        if (organizer_id) whereConditions.organizer_id = organizer_id
        if (status) whereConditions.status = status
        if (scope) whereConditions.scope = scope

        const { rows, count } = await Notification.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: SystemUser,
                    as: 'systemUser',
                    attributes: ['_id', 'name', 'email'],
                },
                {
                    model: Organizer,
                    as: 'organizer',
                    attributes: ['_id', 'name'],
                },
                {
                    model: Event,
                    as: 'targetEvent',
                    attributes: ['_id', 'name'],
                },
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']],
            distinct: true,
        })

        return {
            notifications: rows.map((n) => n.toJSON()),
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find notifications: ${errorMsg}`)
    }
}

/**
 * Update notification
 */
export const updateNotification = async (notificationId, updateData) => {
    try {
        const notification = await Notification.findByPk(notificationId)
        if (!notification) {
            throw new Error('Notification not found')
        }

        // Don't allow updating sent notifications
        if (notification.status === 'sent') {
            throw new Error('Cannot update sent notification')
        }

        await notification.update(updateData)
        return notification.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update notification: ${errorMsg}`)
    }
}

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
    try {
        const notification = await Notification.findByPk(notificationId)
        if (!notification) {
            throw new Error('Notification not found')
        }

        // Don't allow deleting sent notifications
        if (notification.status === 'sent') {
            throw new Error('Cannot delete sent notification')
        }

        await notification.destroy()
        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete notification: ${errorMsg}`)
    }
}

/**
 * Create notification recipients
 */
export const createNotificationRecipients = async (recipients) => {
    try {
        const created = await NotificationRecipient.bulkCreate(recipients, {
            ignoreDuplicates: true,
        })
        return created.map((r) => r.toJSON())
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create recipients: ${errorMsg}`)
    }
}

/**
 * Update notification recipient status
 */
export const updateRecipientStatus = async (recipientId, statusData) => {
    try {
        const recipient = await NotificationRecipient.findByPk(recipientId)
        if (!recipient) {
            throw new Error('Recipient not found')
        }

        await recipient.update(statusData)
        return recipient.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update recipient: ${errorMsg}`)
    }
}

/**
 * Update notification recipient status by composite key
 */
export const updateRecipientStatusByCompositeKey = async (
    notificationId,
    registrationId,
    deviceId,
    statusData
) => {
    try {
        const recipient = await NotificationRecipient.findOne({
            where: {
                notification_id: notificationId,
                registration_id: registrationId,
                device_id: deviceId,
            },
        })

        if (!recipient) {
            throw new Error('Recipient not found')
        }

        await recipient.update(statusData)
        return recipient.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update recipient: ${errorMsg}`)
    }
}

/**
 * Update notification statistics
 */
export const updateNotificationStats = async (notificationId, stats) => {
    try {
        await Notification.update(stats, {
            where: { _id: notificationId },
        })
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update notification stats: ${errorMsg}`)
    }
}

/**
 * Get notification statistics
 */
export const getNotificationStats = async (notificationId) => {
    try {
        const notification = await Notification.findByPk(notificationId, {
            attributes: [
                '_id',
                'title',
                'status',
                'sent_at',
                'total_recipients',
                'total_sent',
                'total_delivered',
                'total_failed',
                'total_opened',
            ],
        })

        if (!notification) {
            throw new Error('Notification not found')
        }

        const stats = notification.toJSON()

        // Calculate rates
        stats.delivery_rate =
            stats.total_sent > 0 ? Math.round((stats.total_delivered / stats.total_sent) * 100) : 0
        stats.open_rate =
            stats.total_delivered > 0 ? Math.round((stats.total_opened / stats.total_delivered) * 100) : 0

        return stats
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get notification stats: ${errorMsg}`)
    }
}

/**
 * Get notifications received by a registration
 */
export const getReceivedNotifications = async (registrationId, deviceId, options = {}) => {
    const { page = 1, limit = 20 } = options

    try {
        const offset = (page - 1) * limit
        const result = await UserDevice.findOne({ where: { device_id: deviceId } })
        if (!result) {
            throw new Error('Device not found')
        }
        const { rows, count } = await NotificationRecipient.findAndCountAll({
            where: { registration_id: registrationId, device_id: result._id },
            include: [
                {
                    model: Notification,
                    as: 'notification',
                    attributes: [
                        '_id',
                        'title',
                        'body',
                        'image_url',
                        'action_type',
                        'action_data',
                        'sent_at',
                    ],
                },
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']],
        })

        return {
            data: rows.map((r) => r.toJSON()),
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get received notifications: ${errorMsg}`)
    }
}

/**
 * Mark notification as opened
 */
export const markNotificationOpened = async (notificationId, registrationId, deviceId = null) => {
    try {
        const whereCondition = {
            notification_id: notificationId,
            registration_id: registrationId,
        }

        if (deviceId) {
            whereCondition.device_id = deviceId
        }

        const recipient = await NotificationRecipient.findOne({
            where: whereCondition,
        })

        if (!recipient) {
            throw new Error('Notification recipient not found')
        }

        // Only update if not already opened
        if (recipient.status !== 'opened') {
            await recipient.update({
                status: 'opened',
                opened_at: new Date(),
            })

            // Increment total_opened in notification
            await Notification.increment('total_opened', {
                where: { _id: notificationId },
            })
        }

        return recipient.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to mark notification as opened: ${errorMsg}`)
    }
}
