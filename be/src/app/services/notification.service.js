import * as notificationRepository from '../../db/notification_repository.js'
import * as userDeviceRepository from '../../db/user_device_repository.js'
import * as fcmService from './fcm.service.js'
import * as cronUtil from '../../utils/cron.util.js'
import Event from '../../model/event.js'
import { Op } from 'sequelize'

/**
 * Create a notification (draft, scheduled, or recurring)
 */
export async function createNotification(data) {
    console.log(data)
    // Validate scope matches sender
    if (data.sender_type === 'system_user' && data.scope === 'all') {
        // Admin sending global notification - OK
    } else if (data.sender_type === 'organizer') {
        // Organizer must specify scope and target
        if (data.scope === 'all') {
            throw new Error('Organizers cannot send global notifications')
        }
        if (data.scope === 'event' && !data.target_event_id) {
            throw new Error('Event ID required for event-scoped notification')
        }
        if (data.scope === 'organizer' && !data.target_organizer_id) {
            throw new Error('Organizer ID required for organizer-scoped notification')
        }
    }

    // Handle recurring notifications
    if (data.is_recurring) {
        if (!data.cron_pattern) {
            throw new Error('Cron pattern is required for recurring notifications')
        }

        // Validate cron pattern
        if (!cronUtil.isValidCronPattern(data.cron_pattern)) {
            throw new Error('Invalid cron pattern')
        }

        const timezone = data.timezone || 'UTC'

        // Calculate next execution time
        const nextSendAt = cronUtil.getNextExecutionTime(data.cron_pattern, timezone)

        if (!nextSendAt) {
            throw new Error('Unable to calculate next execution time from cron pattern')
        }

        // Create recurring notification
        const notification = await notificationRepository.createNotification({
            ...data,
            status: 'active', // Active status for recurring notifications
            is_recurring: true,
            timezone,
            next_send_at: nextSendAt,
            total_recipients: 0,
            total_sent: 0,
            total_delivered: 0,
            total_failed: 0,
            total_opened: 0,
            total_executions: 0,
        })

        return notification
    }

    // Handle one-time scheduled notifications
    let status = 'draft'
    if (data.scheduled_at) {
        const scheduledDate = new Date(data.scheduled_at)
        const now = new Date()

        if (scheduledDate <= now) {
            throw new Error('Scheduled time must be in the future')
        }

        status = 'scheduled'
    }

    // Create one-time notification
    const notification = await notificationRepository.createNotification({
        ...data,
        status,
        is_recurring: false,
        total_recipients: 0,
        total_sent: 0,
        total_delivered: 0,
        total_failed: 0,
        total_opened: 0,
        total_executions: 0,
    })

    return notification
}

/**
 * Get notification by ID
 */
export async function getNotificationById(notificationId, options = {}) {
    return await notificationRepository.findNotificationById(notificationId, options)
}

/**
 * List notifications with filters
 */
export async function listNotifications(filters = {}, options = {}) {
    return await notificationRepository.findAllNotifications(filters, options)
}

/**
 * Update notification (only if status is draft)
 */
export async function updateNotification(notificationId, updates) {
    return await notificationRepository.updateNotification(notificationId, updates)
}

/**
 * Delete notification (only if status is draft)
 */
export async function deleteNotification(notificationId) {
    return await notificationRepository.deleteNotification(notificationId)
}

/**
 * Get devices to send notification to based on scope
 */
async function getTargetDevices(notification) {
    let devices = []

    if (notification.scope === 'all') {
        // Global notification - all active devices
        devices = await userDeviceRepository.getAllActiveDevices()
    } else if (notification.scope === 'event') {
        // Event notification - devices of event attendees
        devices = await userDeviceRepository.getDevicesForEvent(notification.target_event_id)
    } else if (notification.scope === 'organizer') {
        // Organizer notification - devices of organizer's event attendees
        // Get all events for this organizer
        const { Event } = require('../../model/event')
        const events = await Event.findAll({
            where: { organizer_id: notification.target_organizer_id },
            attributes: ['event_id'],
        })

        const eventIds = events.map((e) => e.event_id)

        // Get devices for all these events
        const devicePromises = eventIds.map((eventId) => userDeviceRepository.getDevicesForEvent(eventId))
        const deviceArrays = await Promise.all(devicePromises)

        // Flatten and deduplicate
        const deviceMap = new Map()
        for (const deviceArray of deviceArrays) {
            for (const device of deviceArray) {
                deviceMap.set(device.device_id, device)
            }
        }
        devices = Array.from(deviceMap.values())
    }

    // Filter for active devices with notifications enabled
    return devices.filter((d) => d.is_active && d.notifications_enabled)
}

/**
 * Send notification to target devices
 */
export async function sendNotification(notificationId) {
    const notification = await notificationRepository.findNotificationById(notificationId, {
        includeRecipients: false,
        includeSender: false,
        includeTarget: false,
    })

    if (!notification) {
        throw new Error('Notification not found')
    }

    if (notification.status === 'sent') {
        throw new Error('Notification already sent')
    }

    if (notification.status === 'sending') {
        throw new Error('Notification is currently being sent')
    }

    // Update status to sending
    await notificationRepository.updateNotification(notificationId, {
        status: 'sending',
        sent_at: new Date(),
    })

    try {
        // Get target devices
        const devices = await getTargetDevices(notification)

        if (devices.length === 0) {
            // No devices to send to
            await notificationRepository.updateNotification(notificationId, {
                status: 'sent',
                total_recipients: 0,
                total_sent: 0,
                total_delivered: 0,
                total_failed: 0,
            })
            return {
                success: true,
                message: 'No active devices to send notification to',
                stats: {
                    total_recipients: 0,
                    total_sent: 0,
                    total_failed: 0,
                },
            }
        }
        console.log(devices)

        // Create recipients
        const recipients = devices.map((device) => ({
            notification_id: notificationId,
            registration_id: device.registration_id,
            device_id: device._id,
            status: 'pending',
        }))

        await notificationRepository.createNotificationRecipients(recipients)

        // Update total recipients
        await notificationRepository.updateNotification(notificationId, {
            total_recipients: devices.length,
        })

        // Prepare FCM tokens
        const fcmTokens = devices.map((d) => d.fcm_token)

        // Send via FCM
        const result = await fcmService.sendToBatches(fcmTokens, notification, {
            notification_id: notificationId,
            action_type: notification.action_type || '',
            action_data: notification.action_data || {},
        })

        // Process responses and update recipient statuses
        let totalSent = 0
        let totalFailed = 0

        for (const response of result.allResponses) {
            const device = devices.find((d) => d.fcm_token === response.token)
            if (!device) continue

            if (response.success) {
                totalSent++
                await notificationRepository.updateRecipientStatusByCompositeKey(
                    notificationId,
                    device.registration_id,
                    device._id,
                    {
                        status: 'sent',
                        fcm_message_id: response.messageId,
                        sent_at: new Date(),
                    }
                )
            } else {
                totalFailed++
                await notificationRepository.updateRecipientStatusByCompositeKey(
                    notificationId,
                    device.registration_id,
                    device._id,
                    {
                        status: 'failed',
                        error_message: response.error?.message || 'Unknown error',
                        failed_at: new Date(),
                    }
                )

                // If token is invalid, deactivate the device
                if (
                    response.error?.code === 'messaging/invalid-registration-token' ||
                    response.error?.code === 'messaging/registration-token-not-registered'
                ) {
                    await userDeviceRepository.deactivateDevice(device._id)
                }
            }
        }

        // Update notification stats
        await notificationRepository.updateNotification(notificationId, {
            status: 'sent',
            total_sent: totalSent,
            total_failed: totalFailed,
        })

        return {
            success: true,
            message: 'Notification sent successfully',
            stats: {
                total_recipients: devices.length,
                total_sent: totalSent,
                total_failed: totalFailed,
            },
        }
    } catch (error) {
        // Update status to failed
        await notificationRepository.updateNotification(notificationId, {
            status: 'failed',
        })
        throw error
    }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(notificationId) {
    return await notificationRepository.getNotificationStats(notificationId)
}

/**
 * Mark notification as opened by user
 */
export async function markNotificationOpened(notificationId, registrationId, deviceId) {
    return await notificationRepository.markNotificationOpened(notificationId, registrationId, deviceId)
}

/**
 * Get received notifications for a registration
 */
export async function getReceivedNotifications(registrationId, deviceId, options = {}) {
    return await notificationRepository.getReceivedNotifications(registrationId, deviceId, options)
}

/**
 * Cancel scheduled notification (convert back to draft)
 */
export async function cancelScheduledNotification(notificationId) {
    const notification = await notificationRepository.findNotificationById(notificationId)

    if (!notification) {
        throw new Error('Notification not found')
    }

    if (notification.status !== 'scheduled') {
        throw new Error('Only scheduled notifications can be cancelled')
    }

    return await notificationRepository.updateNotification(notificationId, {
        status: 'draft',
        scheduled_at: null,
    })
}

/**
 * Reschedule notification
 */
export async function rescheduleNotification(notificationId, newScheduledAt) {
    const notification = await notificationRepository.findNotificationById(notificationId)

    if (!notification) {
        throw new Error('Notification not found')
    }

    if (notification.status !== 'scheduled' && notification.status !== 'draft') {
        throw new Error('Can only reschedule draft or scheduled notifications')
    }

    const scheduledDate = new Date(newScheduledAt)
    const now = new Date()

    if (scheduledDate <= now) {
        throw new Error('Scheduled time must be in the future')
    }

    return await notificationRepository.updateNotification(notificationId, {
        status: 'scheduled',
        scheduled_at: scheduledDate,
    })
}

/**
 * Process scheduled notifications that are ready to be sent
 * This should be called by a cron job
 */
export async function processScheduledNotifications() {
    const now = new Date()

    // Find all scheduled notifications that are due
    const dueNotifications = await notificationRepository.findAllNotifications(
        {
            status: 'scheduled',
        },
        {
            page: 1,
            limit: 100, // Process up to 100 at a time
        }
    )

    const results = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
    }
    for (const notification of dueNotifications.notifications) {
        // Check if it's time to send
        if (notification.scheduled_at && new Date(notification.scheduled_at) <= now) {
            results.processed++

            try {
                await sendNotification(notification._id)
                results.successful++
            } catch (error) {
                results.failed++
                results.errors.push({
                    notification_id: notification._id,
                    error: error.message,
                })

                // Mark as failed
                await notificationRepository.updateNotification(notification._id, {
                    status: 'failed',
                })
            }
        }
    }

    return results
}

/**
 * Validate organizer owns event
 */
export async function validateOrganizerOwnsEvent(organizerId, eventId) {
    const event = await Event.findOne({
        where: {
            _id: eventId,
            organizer_id: organizerId,
        },
    })
    console.log(event)
    return !!event
}

/**
 * Process recurring notifications based on cron patterns
 * This should be called by a cron job every minute
 */
export async function processRecurringNotifications() {
    const results = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
    }

    try {
        // Find all active recurring notifications
        const recurringNotifications = await notificationRepository.findAllNotifications(
            {
                status: 'active',
                is_recurring: true,
            },
            {
                page: 1,
                limit: 100, // Process up to 100 at a time
            }
        )

        for (const notification of recurringNotifications.notifications) {
            const {
                _id: notificationId,
                cron_pattern,
                timezone,
                last_sent_at,
                next_send_at,
                recurrence_end_date,
            } = notification

            // Check if recurrence has ended
            if (recurrence_end_date && new Date(recurrence_end_date) < new Date()) {
                await notificationRepository.updateNotification(notificationId, {
                    status: 'sent', // Mark as completed
                })
                continue
            }

            // Check if it's time to execute based on cron pattern
            const shouldExecute = cronUtil.shouldExecuteNow(cron_pattern, last_sent_at, timezone || 'UTC')

            if (shouldExecute) {
                results.processed++

                try {
                    // Send the notification
                    await sendRecurringNotification(notificationId)

                    // Calculate next execution time
                    const nextExecution = cronUtil.getNextExecutionTime(
                        cron_pattern,
                        timezone || 'UTC',
                        new Date()
                    )

                    // Update notification
                    await notificationRepository.updateNotification(notificationId, {
                        last_sent_at: new Date(),
                        next_send_at: nextExecution,
                        total_executions: (notification.total_executions || 0) + 1,
                    })

                    results.successful++
                } catch (error) {
                    results.failed++
                    results.errors.push({
                        notification_id: notificationId,
                        error: error.message,
                    })
                    console.error(`[Recurring Notification] Failed to send ${notificationId}:`, error)
                }
            }
        }
    } catch (error) {
        console.error('[Recurring Notification] Error processing recurring notifications:', error)
    }

    return results
}

/**
 * Send a recurring notification (doesn't change status to 'sent')
 */
async function sendRecurringNotification(notificationId) {
    const notification = await notificationRepository.findNotificationById(notificationId, {
        includeRecipients: false,
        includeSender: false,
        includeTarget: false,
    })

    if (!notification) {
        throw new Error('Notification not found')
    }

    if (notification.status !== 'active') {
        throw new Error('Only active recurring notifications can be sent')
    }

    try {
        // Get target devices
        const devices = await getTargetDevices(notification)

        if (devices.length === 0) {
            console.log(`[Recurring Notification] No active devices for notification ${notificationId}`)
            return {
                success: true,
                message: 'No active devices to send notification to',
                stats: {
                    total_recipients: 0,
                    total_sent: 0,
                    total_failed: 0,
                },
            }
        }

        // Prepare FCM tokens
        const fcmTokens = devices.map((d) => d.fcm_token)

        // Send via FCM
        const result = await fcmService.sendToBatches(fcmTokens, notification, {
            notification_id: notificationId,
            action_type: notification.action_type || '',
            action_data: notification.action_data || {},
        })

        // Process responses
        let totalSent = 0
        let totalFailed = 0

        for (const response of result.allResponses) {
            if (response.success) {
                totalSent++
            } else {
                totalFailed++

                // If token is invalid, deactivate the device
                if (
                    response.error?.code === 'messaging/invalid-registration-token' ||
                    response.error?.code === 'messaging/registration-token-not-registered'
                ) {
                    const device = devices.find((d) => d.fcm_token === response.token)
                    if (device) {
                        await userDeviceRepository.deactivateDevice(device._id)
                    }
                }
            }
        }

        // Update cumulative stats
        await notificationRepository.updateNotification(notificationId, {
            total_recipients: (notification.total_recipients || 0) + devices.length,
            total_sent: (notification.total_sent || 0) + totalSent,
            total_failed: (notification.total_failed || 0) + totalFailed,
        })

        return {
            success: true,
            message: 'Recurring notification sent successfully',
            stats: {
                total_recipients: devices.length,
                total_sent: totalSent,
                total_failed: totalFailed,
            },
        }
    } catch (error) {
        throw error
    }
}

/**
 * Pause a recurring notification
 */
export async function pauseRecurringNotification(notificationId) {
    const notification = await notificationRepository.findNotificationById(notificationId)

    if (!notification) {
        throw new Error('Notification not found')
    }

    if (!notification.is_recurring) {
        throw new Error('Only recurring notifications can be paused')
    }

    if (notification.status !== 'active') {
        throw new Error('Only active recurring notifications can be paused')
    }

    return await notificationRepository.updateNotification(notificationId, {
        status: 'draft', // Paused state
    })
}

/**
 * Resume a paused recurring notification
 */
export async function resumeRecurringNotification(notificationId) {
    const notification = await notificationRepository.findNotificationById(notificationId)

    if (!notification) {
        throw new Error('Notification not found')
    }

    if (!notification.is_recurring) {
        throw new Error('Only recurring notifications can be resumed')
    }

    if (notification.status !== 'draft') {
        throw new Error('Only paused recurring notifications can be resumed')
    }

    // Recalculate next execution time
    const nextExecution = cronUtil.getNextExecutionTime(
        notification.cron_pattern,
        notification.timezone || 'UTC',
        new Date()
    )

    return await notificationRepository.updateNotification(notificationId, {
        status: 'active',
        next_send_at: nextExecution,
    })
}

/**
 * Get cron pattern description
 */
export async function getCronDescription(cronPattern, timezone = 'UTC') {
    return cronUtil.validateAndDescribeCron(cronPattern, timezone)
}

/**
 * Get common cron patterns
 */
export async function getCommonCronPatterns() {
    return cronUtil.getCommonCronPatterns()
}
