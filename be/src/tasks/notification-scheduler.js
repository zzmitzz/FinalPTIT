import {CronJob} from 'cron'
import * as notificationService from '../app/services/notification.service.js'

/**
 * Scheduled notification processor
 * Runs every minute to check for notifications that are ready to be sent
 * Handles both one-time scheduled and recurring cron-based notifications
 */
export const scheduledNotificationJob = new CronJob(
    '* * * * *', // Every minute
    async function () {
        try {
            console.log('[Scheduler] Checking for scheduled and recurring notifications...')

            // Process one-time scheduled notifications
            const scheduledResults = await notificationService.processScheduledNotifications()

            // Process recurring notifications
            const recurringResults = await notificationService.processRecurringNotifications()

            const totalProcessed = scheduledResults.processed + recurringResults.processed
            const totalSuccessful = scheduledResults.successful + recurringResults.successful
            const totalFailed = scheduledResults.failed + recurringResults.failed

            if (totalProcessed > 0) {
                console.log(
                    `[Scheduler] Processed ${totalProcessed} notifications: ` +
                        `${totalSuccessful} successful, ${totalFailed} failed ` +
                        `(${scheduledResults.processed} one-time, ${recurringResults.processed} recurring)`
                )

                if (scheduledResults.errors.length > 0 || recurringResults.errors.length > 0) {
                    console.error('[Scheduler] Errors:', [
                        ...scheduledResults.errors,
                        ...recurringResults.errors,
                    ])
                }
            }
        } catch (error) {
            console.error('[Scheduler] Error processing notifications:', error)
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
    console.log('   - Processes one-time scheduled notifications')
    console.log('   - Processes recurring cron-based notifications')
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
    scheduledNotificationJob.stop()
    console.log('❌ Notification scheduler stopped')
}
