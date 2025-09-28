import createModel, { ObjectId } from '../base'



const LwPrize = createModel(
    'LwPrize',
    'lucky_wheel_prizes',
    {
        event_id: {
            type: ObjectId,
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
        availability: {
            type: Boolean,
            required: true,
            default: false,
        },
    },{
        virtuals: {
            event: {
                options: {
                    ref: 'Event',
                    localField: 'event_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
        }
    }
)

export default LwPrize