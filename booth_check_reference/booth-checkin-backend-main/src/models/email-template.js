import createModel, { ObjectId } from '@/models/base'

const EmailTemplate = createModel(
    'EmailTemplate',
    'email_templates',
    {
        event_id: {
            type: ObjectId,
            ref: 'Event',
            required: true,
        },
        organizer_id: {
            type: ObjectId,
            ref: 'Organizer',
            required: true,
        },
        template_name: {
            type: String,
            required: true,
        },
        sender_name: {
            type: String,
            default: '',
        },
        subject: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        attachments: {
            type: [String],
            default: [],
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        virtuals: {
            organizer: {
                options: {
                    ref: 'Organizer',
                    localField: 'organizer_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            event: {
                options: {
                    ref: 'Event',
                    localField: 'event_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
        },
    }
)

export default EmailTemplate