import createModel, { LUCKY_WHEEL_TYPE, ObjectId } from '../base'

const LwHistory = createModel(
    'LwHistory',
    'lucky_wheel_histories',
    {
        registration_id: {
            type: String,
            required: false
        },
        lucky_wheel_id: {
            type: String,
            required: true,
        },
        prize_id: {
            type: ObjectId,
            required: true,
        },
        prize_name: {
            type: String,
            required: true
        },
        awared_at: {
            type: Date,
            required: true
        },
        lucky_wheel_type: {
            type: String,
            enum: Object.values(LUCKY_WHEEL_TYPE),
            required: true,
        }
    },
    {
        virtuals: {
            registrations: {
                options: {
                    ref: 'Registration',
                    localField: 'registration_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            lucky_wheel: {
                options: {
                    ref: 'LuckyWheel',
                    localField: 'lucky_wheel_id',
                    foreignField: '_id',
                    justOne: true,
                }
            },
            prize: {
                options: {
                    ref: 'LwPrize',
                    localField: 'prize_id',
                    foreignField: '_id',
                    justOne: true,
                }
            }
        }
    }
)

export default LwHistory