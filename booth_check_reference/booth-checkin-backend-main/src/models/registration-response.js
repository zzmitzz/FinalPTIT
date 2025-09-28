import {Schema} from 'mongoose'
import createModel, {FIELD_TYPE, Mixed, ObjectId} from './base'

const RegistrationResponse = createModel('RegistrationResponse', 'registration_responses', {
    event_id: {
        type: ObjectId,
        ref: 'Event',
        required: true,
    },
    form_id: {
        type: ObjectId,
        ref: 'Form',
        required: true,
    },
    registration_id: {
        type: ObjectId,
        ref: 'Registration',
        required: true,
    },
    is_primary_key: {
        type: Boolean,
        required: true,
    },
    field_label: {
        type: String,
        required: true,
    },
    field_description: {
        type: String,
        default: '',
    },
    field_type: {
        type: String,
        enum: Object.values(FIELD_TYPE),
        required: true,
    },
    field_options: {
        type: [String],
        default: [],
    },
    field_has_other_option: {
        type: Boolean,
        default: false,
    },
    field_range: {
        type: new Schema({
            min: {
                type: Number,
                default: null,
            },
            max: {
                type: Number,
                default: null,
            },
        }),
        default: {min: null, max: null},
    },
    field_extensions: {
        type: [String],
        default: [],
    },
    required: {
        type: Boolean,
        default: false,
        required: true,
    },
    position: {
        type: Number,
        required: true,
    },
    response: {
        type: Mixed,
        default: null,
    },
})

export default RegistrationResponse
