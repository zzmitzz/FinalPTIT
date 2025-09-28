import createModel, {EVENT_MINI_GAME, ObjectId} from './base'

const MiniGameSetting = createModel(
    'MiniGameSetting',
    'mini_game_settings',
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
        conditions: {
            type: String,
            default: null,
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

export default MiniGameSetting
