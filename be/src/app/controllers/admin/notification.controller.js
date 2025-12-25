import * as notificationService from '../../services/notification.service.js'
import * as adminRepository from '../../../db/admin_rbac_repository.js'

/**
 * Create notification (draft, scheduled, or recurring)
 */
export async function createNotification(req, res, next) {
    try {
        const systemUserId = req.currentUser._id

        // Check if user has permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:CREATE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to create notifications',
            })
        }

        const {
            title,
            body,
            image_url,
            scope,
            target_event_id,
            target_organizer_id,
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
                message: 'Scope is required (all, event, or organizer)',
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

        // If scope is 'all', check for SEND_GLOBAL permission
        if (scope === 'all') {
            const hasSendGlobal = await adminRepository.adminHasPermission(
                systemUserId,
                'NOTIFICATION:SEND_GLOBAL'
            )
            if (!hasSendGlobal) {
                return res.status(403).json({
                    success: false,
                    message:
                        'You do not have permission to send global notifications. Only Super Admins can send to all users.',
                })
            }
        }

        // Create notification
        const notification = await notificationService.createNotification({
            sender_type: 'system_user',
            system_user_id: systemUserId,
            title,
            body,
            image_url,
            scope,
            target_event_id: scope === 'event' ? target_event_id : null,
            target_organizer_id: scope === 'organizer' ? target_organizer_id : null,
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
 * List notifications
 */
export async function listNotifications(req, res, next) {
    try {
        const systemUserId = req.currentUser._id

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:READ')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view notifications',
            })
        }

        const {page = 1, limit = 20, status, scope, sender_type, from_date, to_date} = req.query

        const filters = {}
        if (status) filters.status = status
        if (scope) filters.scope = scope
        if (sender_type) filters.sender_type = sender_type
        if (from_date) filters.from_date = from_date
        if (to_date) filters.to_date = to_date

        // Admin can see all notifications
        filters.sender_type = 'system_user'

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
 * Get notification by ID
 */
export async function getNotification(req, res, next) {
    try {
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:READ')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view notifications',
            })
        }

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

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
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
 * Update notification (only draft)
 */
export async function updateNotification(req, res, next) {
    try {
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:MANAGE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to manage notifications',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        const {
            title,
            body,
            image_url,
            scope,
            target_event_id,
            target_organizer_id,
            action_type,
            action_data,
        } = req.body

        // If changing scope to 'all', verify permission
        if (scope === 'all' && notification.scope !== 'all') {
            const hasSendGlobal = await adminRepository.adminHasPermission(
                systemUserId,
                'NOTIFICATION:SEND_GLOBAL'
            )
            if (!hasSendGlobal) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to send global notifications',
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
            } else if (scope === 'organizer' && target_organizer_id) {
                updates.target_organizer_id = target_organizer_id
                updates.target_event_id = null
            } else if (scope === 'all') {
                updates.target_event_id = null
                updates.target_organizer_id = null
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
 * Delete notification (only draft)
 */
export async function deleteNotification(req, res, next) {
    try {
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:MANAGE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to manage notifications',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
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
 * Send notification
 */
export async function sendNotification(req, res, next) {
    try {
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:MANAGE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to send notifications',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            })
        }

        // If scope is 'all', verify SEND_GLOBAL permission
        if (notification.scope === 'all') {
            const hasSendGlobal = await adminRepository.adminHasPermission(
                systemUserId,
                'NOTIFICATION:SEND_GLOBAL'
            )
            if (!hasSendGlobal) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to send global notifications',
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
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:READ')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view notification statistics',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
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
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:MANAGE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to manage notifications',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
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
        const systemUserId = req.currentUser._id
        const {id} = req.params
        const {scheduled_at} = req.body

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:MANAGE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to manage notifications',
            })
        }

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

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
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
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:MANAGE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to manage notifications',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
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
        const systemUserId = req.currentUser._id
        const {id} = req.params

        // Check permission
        const hasPermission = await adminRepository.adminHasPermission(systemUserId, 'NOTIFICATION:MANAGE')
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to manage notifications',
            })
        }

        const notification = await notificationService.getNotificationById(id)
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            })
        }

        // Verify it's a system_user notification
        if (notification.sender_type !== 'system_user') {
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
        const {cron_pattern, timezone} = req.body

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
