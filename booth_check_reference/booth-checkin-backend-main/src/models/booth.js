import {Schema} from 'mongoose'
import createModel, {EVENT_CHECK_IN_TYPE, ObjectId} from './base'

const Booth = createModel(
    'Booth',
    'booths',
    {
        name: {
            type: String,
            required: true,
        },
        mac: {
            type: String,
            required: true,
            unique: true,
        },
        last_time: {
            type: Date,
            default: null,
        },
        event_id: {
            type: ObjectId,
            ref: 'Event',
        },
        setting: {
            type: new Schema({
                check_in_type: {
                    type: [
                        {
                            type: String,
                            enum: Object.values(EVENT_CHECK_IN_TYPE),
                        },
                    ],
                    required: true,
                },
                use_print_card: {
                    type: Boolean,
                    required: true,
                },
                allow_check_in: {
                    type: Boolean,
                    required: true,
                },

            }),
            default: {
                check_in_type: [EVENT_CHECK_IN_TYPE.QR_CODE],
                use_print_card: true,
                allow_check_in: true,
            },
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
        },
    }
)

export default Booth
