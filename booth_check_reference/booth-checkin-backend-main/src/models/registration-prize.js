import createModel, {ObjectId} from './base'

const RegistrationPrize = createModel(
    'RegistrationPrize',
    'registration_prizes',
    {
        registration_id: {
            type: ObjectId,
            required: true,
        },
        prize_id: {
            type: ObjectId,
            required: true,
        },
        booth_mac: {
            type: String,
            default: null,
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
            prize: {
                options: {
                    ref: 'Prize',
                    localField: 'prize_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
        },
    }
)

RegistrationPrize.schema.index({registration_id: 1, prize_id: 1}, {unique: true})

export default RegistrationPrize
