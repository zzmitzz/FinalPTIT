import createModel, { ObjectId } from '../base'

const LwDetail = createModel(
    'LwDetail',
    'lucky_wheel_details',
    {
        lucky_wheel_id: {
            type: ObjectId,
            required: true,
        },
        prize_id: {
            type: ObjectId,
            required: true,
        },  
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
    },
    {
        virtuals: {
            lucky_wheel: {
                options: {
                    ref: 'LuckyWheel',
                    localField: 'lucky_wheel_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            lw_prize: {
                options: {
                    ref: 'LwPrize',
                    localField: 'prize_id',
                    foreignField: '_id',
                },
            },
        }
    }
)

export default LwDetail