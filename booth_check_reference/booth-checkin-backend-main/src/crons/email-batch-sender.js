import cron from 'node-cron'
import { EMAIL_JOB_STATUS } from '@/models'
import { sendEmailWithTemplate } from '@/app/services/email-sender-service/email-sender-service'
import EmailJobs from '@/models/email_sender_jobs/email-jobs'

const BATCH_SIZE = 10

/**
 * * * * * *	Every minute
0 * * * *	Every hour (on the 0th minute)
0 9 * * *	Every day at 9:00 AM
0 9 * * 1-5	Every weekday at 9:00 AM
0 0 * * 0	Every Sunday at midnight
 */
cron.schedule('* * * * *', async () => {
    const jobs = await EmailJobs.find({
        $or: [
            { status: EMAIL_JOB_STATUS.PENDING },
            { status: EMAIL_JOB_STATUS.RETRY },
        ],
    }).limit(BATCH_SIZE)
    if(jobs.length > 0){
        console.log(`Found ${jobs.length} jobs to send`)
    }
    for (const job of jobs) {
        try {
            await sendEmailWithTemplate({
                templateId: job.template_id,
                registrationId: job.registration_id,
                eventId: job.event_id,
            })

            job.status = EMAIL_JOB_STATUS.SENT
        } catch (error) {
            if(error.message.includes('No email found')){
                job.status = EMAIL_JOB_STATUS.FAILED
                job.last_error = error.message
                job.last_attempt = new Date()
                await job.save()
                continue
            }
            if (job.attempts >= 3) {
                job.status = EMAIL_JOB_STATUS.FAILED
                job.last_error = error.message
                job.last_attempt = new Date()
                await job.save()
                continue
            }
            job.status = EMAIL_JOB_STATUS.RETRY
            job.last_error = error.message
            job.last_attempt = new Date()
        }

        job.attempts = job.attempts + 1
        await job.save()
    }
})
