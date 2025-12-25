import * as notificationService from '../../services/notification.service.js'

/**
 * Create notification (organizer can only send to their events)
 * Supports both one-time scheduled and recurring cron-based notifications
 */
export async function createNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id

        const { title, body, image_url, scope, target_event_id, action_type, action_data, scheduled_at } =
            req.body
        const {
            title,
            body,
            image_url,
            scope,
            target_event_id,
            action_type,
            action_data,
            scheduled_at,
            is_recurring,
            cron_pattern,
            timezone,
            recurrence_end_date,
        } = req.body

        // Validate required fields
        if (!title || !body) {
            return res.status(400).json({
                success: false,
                message: 'Title and body are required',
            })
        }

        if (!scope) {
            return res.status(400).json({
                success: false,
                message: 'Scope is required (event or organizer)',
            })
        }

        // Validate recurring notification
        if (is_recurring) {
            if (!cron_pattern) {
                return res.status(400).json({
                    success: false,
                    message: 'Cron pattern is required for recurring notifications',
                })
            }

            // Validate cron pattern
            const cronValidation = await notificationService.getCronDescription(
                cron_pattern,
                timezone || 'UTC'
            )
            if (!cronValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid cron pattern',
                    error: cronValidation.error,
                })
            }
        }

        // Validate scheduled_at if provided (for one-time scheduled)
        if (scheduled_at && !is_recurring) {
            const scheduledDate = new Date(scheduled_at)
            if (isNaN(scheduledDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid scheduled_at date format. Use ISO 8601 format.',
                })
            }
        }

        // Organizers cannot send global notifications
        if (scope === 'all') {
            return res.status(403).json({
                success: false,
                message: 'Organizers cannot send global notifications',
            })
        }

        // If scope is event, verify organizer owns the event
        if (scope === 'event') {
            if (!target_event_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Event ID is required for event-scoped notifications',
                })
            }

            const ownsEvent = await notificationService.validateOrganizerOwnsEvent(
                organizerId,
                target_event_id
            )
            if (!ownsEvent) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to send notifications for this event',
                })
            }
        }

        console.log('scope', scope)
        // Create notification
        const notification = await notificationService.createNotification({
            sender_type: 'organizer',
            organizer_id: organizerId,
            title,
            body,
            image_url,
            scope,
            target_event_id: scope === 'event' ? target_event_id : null,
            target_organizer_id: scope === 'organizer' ? organizerId : null,
            action_type,
            action_data,
            scheduled_at: scheduled_at || null,
            is_recurring: is_recurring || false,
            cron_pattern: cron_pattern || null,
            timezone: timezone || 'UTC',
            recurrence_end_date: recurrence_end_date || null,
        })

        let message = 'Notification created successfully'
        if (is_recurring) {
            const cronInfo = await notificationService.getCronDescription(cron_pattern, timezone || 'UTC')
            message = `Recurring notification activated: ${cronInfo.description}`
        } else if (scheduled_at) {
            message = `Notification scheduled for ${new Date(scheduled_at).toISOString()}`
        }

        return res.status(201).json({
            success: true,
            message,
            data: notification,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * List notifications (only organizer's own)
 */
export async function listNotifications(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id

        const { page = 1, limit = 20, status, scope, from_date, to_date } = req.query

        const filters = {
            sender_type: 'organizer',
            organizer_id: organizerId,
        }
        if (status) filters.status = status
        if (scope) filters.scope = scope
        if (from_date) filters.from_date = from_date
        if (to_date) filters.to_date = to_date

        const result = await notificationService.listNotifications(filters, {
            page: parseInt(page),
            limit: parseInt(limit),
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
 * Get notification by ID (only organizer's own)
 */
export async function getNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id, {
            includeRecipients: true,
            includeSender: true,
            includeTarget: true,
        })

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        return res.status(200).json({
            success: true,
            data: notification,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Update notification (only draft and organizer's own)
 */
export async function updateNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const { title, body, image_url, scope, target_event_id, action_type, action_data } = req.body

        // Organizers cannot change scope to 'all'
        if (scope === 'all') {
            return res.status(403).json({
                success: false,
                message: 'Organizers cannot send global notifications',
            })
        }

        // If changing to event scope, verify ownership
        if (scope === 'event' && target_event_id) {
            const ownsEvent = await notificationService.validateOrganizerOwnsEvent(
                organizerId,
                target_event_id
            )
            if (!ownsEvent) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to send notifications for this event',
                })
            }
        }

        const updates = {}
        if (title !== undefined) updates.title = title
        if (body !== undefined) updates.body = body
        if (image_url !== undefined) updates.image_url = image_url
        if (scope !== undefined) {
            updates.scope = scope
            if (scope === 'event' && target_event_id) {
                updates.target_event_id = target_event_id
                updates.target_organizer_id = null
            } else if (scope === 'organizer') {
                updates.target_organizer_id = organizerId
                updates.target_event_id = null
            }
        }
        if (action_type !== undefined) updates.action_type = action_type
        if (action_data !== undefined) updates.action_data = action_data

        const updated = await notificationService.updateNotification(id, updates)

        return res.status(200).json({
            success: true,
            message: 'Notification updated successfully',
            data: updated,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Delete notification (only draft and organizer's own)
 */
export async function deleteNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        await notificationService.deleteNotification(id)

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Send notification (organizer's own)
 */
export async function sendNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        // If scope is event, verify organizer still owns the event
        if (notification.scope === 'event') {
            const ownsEvent = await notificationService.validateOrganizerOwnsEvent(
                organizerId,
                notification.target_event_id
            )
            if (!ownsEvent) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to send notifications for this event',
                })
            }
        }

        const result = await notificationService.sendNotification(id)

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.stats,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const stats = await notificationService.getNotificationStats(id)

        return res.status(200).json({
            success: true,
            data: stats,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Cancel scheduled notification
 */
export async function cancelScheduledNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const updated = await notificationService.cancelScheduledNotification(id)

        return res.status(200).json({
            success: true,
            message: 'Scheduled notification cancelled successfully',
            data: updated,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Reschedule notification
 */
export async function rescheduleNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params
        const { scheduled_at } = req.body

        if (!scheduled_at) {
            return res.status(400).json({
                success: false,
                message: 'scheduled_at is required',
            })
        }

        // Validate date format
        const scheduledDate = new Date(scheduled_at)
        if (isNaN(scheduledDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid scheduled_at date format. Use ISO 8601 format.',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const updated = await notificationService.rescheduleNotification(id, scheduled_at)

        return res.status(200).json({
            success: true,
            message: `Notification rescheduled for ${scheduledDate.toISOString()}`,
            data: updated,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Pause recurring notification
 */
export async function pauseRecurringNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const updated = await notificationService.pauseRecurringNotification(id)

        return res.status(200).json({
            success: true,
            message: 'Recurring notification paused successfully',
            data: updated,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Resume recurring notification
 */
export async function resumeRecurringNotification(req, res, next) {
    try {
        const organizerId = req.currentOrganizer._id
        const { id } = req.params

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify organizer owns this notification
        if (notification.sender_type !== 'organizer' || notification.organizer_id !== organizerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const updated = await notificationService.resumeRecurringNotification(id)

        return res.status(200).json({
            success: true,
            message: 'Recurring notification resumed successfully',
            data: updated,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Validate cron pattern and get human-readable description
 */
export async function validateCronPattern(req, res, next) {
    try {
        const { cron_pattern, timezone } = req.body

        if (!cron_pattern) {
            return res.status(400).json({
                success: false,
                message: 'cron_pattern is required',
            })
        }

        const cronInfo = await notificationService.getCronDescription(cron_pattern, timezone || 'UTC')

        return res.status(200).json({
            success: true,
            data: cronInfo,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get common cron patterns
 */
export async function getCommonCronPatterns(req, res, next) {
    try {
        const patterns = await notificationService.getCommonCronPatterns()

        return res.status(200).json({
            success: true,
            data: patterns,
        })
    } catch (error) {
        next(error)
    }
}
