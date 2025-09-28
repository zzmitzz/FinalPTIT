import createModel, {EVENT_CHECK_IN_TYPE, ObjectId} from './base'

const CheckInHistory = createModel(
    'CheckInHistory',
    'check_in_histories',
    {
        registration_id: {
            type: ObjectId,
            required: true,
        },
        event_id: {
            type: ObjectId,
            required: true,
        },
        booth_mac: {
            type: String,
            required: true,
        },
        check_in_at: {
            type: Date,
            required: true,
        },
        check_in_by: {
            type: String,
            enum: Object.values(EVENT_CHECK_IN_TYPE),
            required: true,
        },
    },
    {
        virtuals: {
            registration: {
                options: {
                    ref: 'Registration',
                    localField: 'registration_id',
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

export default CheckInHistory
