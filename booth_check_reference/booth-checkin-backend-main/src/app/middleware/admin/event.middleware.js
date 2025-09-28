import {isValidObjectId} from 'mongoose'
import {Event} from '@/models'
import {abort} from '@/utils/helpers'
import {handleCheckAction} from '@/app/services/event.service'

export const checkEventId = async function (req, res, next) {
    const _id = req.params.eventId

    if (isValidObjectId(_id)) {
        const event = await Event.findOne({_id, deleted: false})

        if (event) {
            req.event = event
            return next()
        }
    }

    abort(404, 'Sự kiện không tồn tại hoặc đã bị xóa.')
}

export const checkActionEvent = (action) => (req, res, next) => {
    const check = handleCheckAction(req.event, action)

    if (check) {
        return next()
    }

    abort(403)
}

export function checkMiniGameCode(req, res, next) {
    if (!req.event.mini_game.includes(req.params.MINI_GAME_CODE)) {
        abort(404)
    }
    next()
}
