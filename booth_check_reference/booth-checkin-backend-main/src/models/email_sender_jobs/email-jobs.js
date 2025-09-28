import createModel, { ObjectId, EMAIL_JOB_STATUS } from '@/models/base'

const EmailJobs = createModel(
    'EmailJobs',
    'email_jobs',
    {
        registration_id: {
            type: ObjectId,
            ref: 'Registration',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(EMAIL_JOB_STATUS),
            default: EMAIL_JOB_STATUS.PENDING,
        },
        event_id: {
            type: ObjectId,
            ref: 'Event',
            required: true,
        },
        template_id: {
            type: ObjectId,
            ref: 'EmailTemplate',
            required: true,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        last_attempt: {
            type: Date,
            default: null,
        },
        last_error: {
            type: String,
        }
    },
    {
        virtuals: {
            event: {
                options: {
                    ref: 'Event',
                    localField: 'event_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            template: {
                options: {
                    ref: 'EmailTemplate',
                    localField: 'template_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            registration: {
                options: {
                    ref: 'Registration',
                    localField: 'registration_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
        },
    }
)

export default EmailJobs