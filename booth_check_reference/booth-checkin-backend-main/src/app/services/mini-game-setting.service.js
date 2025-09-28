import {MiniGameSetting} from '@/models'

export async function updateMiniGameSettingOfEvent(session, event, {mini_game, conditions}) {
    await MiniGameSetting.findOneAndUpdate(
        {event_id: event._id, mini_game},
        {$set: {conditions}},
        {upsert: true, session}
    )
}

export async function getMiniGameSetting(event, miniGameCode) {
    const result = await MiniGameSetting.findOne({
        event_id: event._id,
        mini_game: miniGameCode,
    })
    return (
        result ?? {
            event_id: event._id,
            mini_game: miniGameCode,
            conditions: null,
        }
    )
}
