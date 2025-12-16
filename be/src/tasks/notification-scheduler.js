import {CronJob} from 'cron'
import * as notificationService from '../app/services/notification.service.js'

/**
 * Scheduled notification processor
 * Runs every minute to check for notifications that are ready to be sent
 */
export const scheduledNotificationJob = new CronJob(
    '* * * * *', // Every minute
    async function () {
        try {
            console.log('[Scheduler] Checking for scheduled notifications...')

            const results = await notificationService.processScheduledNotifications()

            if (results.processed > 0) {
                console.log(
                    `[Scheduler] Processed ${results.processed} notifications: ` +
                        `${results.successful} successful, ${results.failed} failed`
                )

                if (results.errors.length > 0) {
                    console.error('[Scheduler] Errors:', results.errors)
                }
            }
        } catch (error) {
            console.error('[Scheduler] Error processing scheduled notifications:', error)
        }
    },
    null, // onComplete
    false, // start now
    'UTC' // timezone
)

/**
 * Start the scheduler
 */
export function startScheduler() {
    scheduledNotificationJob.start()
    console.log('✅ Notification scheduler started (runs every minute)')
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
    scheduledNotificationJob.stop()
    console.log('❌ Notification scheduler stopped')
}
