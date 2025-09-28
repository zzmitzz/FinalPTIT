import createModel, { EVENT_CHECK_IN_TYPE, ObjectId } from './base'

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the registration
 *         event_id:
 *           type: string
 *           description: Reference to the event this registration belongs to
 *         form_id:
 *           type: string
 *           description: Reference to the form used for registration
 *         check_in_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the attendee checked in
 *         check_in_by:
 *           type: string
 *           enum: [booth, self]
 *           description: Method used to check in
 *         is_vip:
 *           type: boolean
 *           description: Indicates if the registrant is a VIP
 *           default: false
 *       required:
 *         - event_id
 *         - form_id
 */
const Registration = createModel(
    'Registration',
    'registrations',
    {
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
        check_in_at: {
            type: Date,
            default: null,
        },
        check_in_by: {
            type: String,
            enum: Object.values(EVENT_CHECK_IN_TYPE),
            default: null,
        },
        is_vip: {
            type: Boolean,
            default: false,
        },
    },
    {
        virtuals: {
            response: {
                options: {
                    ref: 'RegistrationResponse',
                    localField: '_id',
                    foreignField: 'registration_id',
                },
            },
            prizes: {
                options: {
                    ref: 'RegistrationPrize',
                    localField: '_id',
                    foreignField: 'registration_id',
                },
            }
        },
    }
)

export default Registration
