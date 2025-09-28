import createModel, { EVENT_CHECK_IN_TYPE, EVENT_MINI_GAME, EVENT_STATUS, ObjectId } from './base'

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the event
 *         organizer_id:
 *           type: string
 *           description: Reference to the organizer who created this event
 *         name:
 *           type: string
 *           description: Event name
 *         thumbnail:
 *           type: string
 *           description: URL to event thumbnail image
 *         logo:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs to event logo images
 *         description:
 *           type: string
 *           description: Detailed description of the event
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Event end date and time
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: Current status of the event
 *       required:
 *         - organizer_id
 *         - name
 *         - thumbnail
 *         - start_time
 */
const Event = createModel(
    'Event',
    'events',
    {
        organizer_id: {
            type: ObjectId,
            ref: 'Organizer',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        logo: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            default: '',
        },
        start_time: {
            type: Date,
            required: true,
        },
        end_time: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        organizing_unit: {
            type: String,
            required: true,
        },
        co_organizing_unit: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: Object.values(EVENT_STATUS),
            default: EVENT_STATUS.PENDING,
            required: true,
        },
        check_in_type: {
            type: [
                {
                    type: String,
                    enum: Object.values(EVENT_CHECK_IN_TYPE),
                },
            ],
            required: true,
            default: [],
        },
        booth_check_in: {
            type: Number,
            required: true,
            default: 0,
        },
        mini_game: {
            type: [
                {
                    type: String,
                    enum: Object.values(EVENT_MINI_GAME),
                },
            ],
            required: true,
            default: [],
        },
        use_print_card: {
            type: Boolean,
            required: true,
            default: false,
        },
        pin_code: {
            type: String,
            unique: true,
            required: true,
        },
        approver_id: {
            type: ObjectId,
            ref: 'Admin',
            default: null,
        },
        approved_at: {
            type: Date,
            default: null,
        },
        is_locked: {
            type: Boolean,
            required: true,
            default: false,
        },
        deleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        virtuals: {
            organizer: {
                options: {
                    ref: 'Organizer',
                    localField: 'organizer_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            approver: {
                options: {
                    ref: 'Admin',
                    localField: 'approver_id',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            booths: {
                options: {
                    ref: 'Booth',
                    localField: '_id',
                    foreignField: 'event_id',
                },
            },
            mini_game_settings: {
                options: {
                    ref: 'MiniGameSetting',
                    localField: '_id',
                    foreignField: 'event_id',
                },
            },
        },
    }
)

export default Event
