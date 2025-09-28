import { required } from 'joi'
import createModel, { LUCKY_WHEEL_TYPE, ObjectId } from '../base'


const LuckyWheel = createModel(
    'LuckyWheel',
    'lucky_wheels',
    {
        event_id: {
            type: ObjectId,
            required: true
        },
        title: {
            type: String,
            require: true
        },
        type: {
            type: String,
            enum: Object.values(LUCKY_WHEEL_TYPE),
            required: true,
        },
        created_by: {
            type: ObjectId,
            required: true
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
        }
    }
)

export default LuckyWheel