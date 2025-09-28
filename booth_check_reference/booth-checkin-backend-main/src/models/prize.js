import createModel, {EVENT_MINI_GAME, ObjectId} from './base'

const Prize = createModel(
    'Prize',
    'prizes',
    {
        event_id: {
            type: ObjectId,
            required: true,
        },
        mini_game: {
            type: String,
            enum: Object.values(EVENT_MINI_GAME),
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        picture: {
            type: String,
            default: '',
        },
        rate: {
            type: Number,
            required: true,
            default: 0,
        },
        quantity: {
            type: Number,
            min: 0,
            default: null,
        },
        distributed_count: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        position: {
            type: Number,
            required: true,
            default: 0,
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
                },
            },
            registrations: {
                options: {
                    ref: 'RegistrationPrize',
                    localField: '_id',
                    foreignField: 'prize_id',
                },
            },
        },
    }
)

export default Prize
