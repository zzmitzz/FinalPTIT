import createModel, {ObjectId} from './base'

const Form = createModel(
    'Form',
    'forms',
    {
        event_id: {
            type: ObjectId,
            ref: 'Event',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        is_public: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        virtuals: {
            event: {
                options: {
                    ref: 'Event',
                    localField: 'event_id',
                    foreignField: '_id',
                    justOne: true,
                }
            },
            fields: {
                options: {
                    ref: 'FormField',
                    localField: '_id',
                    foreignField: 'form_id',
                },
            },
        },
    }
)

export default Form
