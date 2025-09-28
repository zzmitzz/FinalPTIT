import {STATUS_DEFAULT_MESSAGE} from '@/configs'
import {Event} from '@/models'
import {match} from 'path-to-regexp'

export const path = '/booth/event/:eventId'

const urlMatch = match(path, {decode: decodeURIComponent})

export async function verifyEventId(socket, next) {
    try {
        const eventId = urlMatch(socket.nsp.name).params.eventId
        if (eventId) {
            const event = await Event.findOne({_id: eventId, deleted: false})
            if (event) {
                socket.event = event
                return next()
            }
        }
        next({message: 'Không tìm thấy sự kiện.'})
    } catch (error) {
        next({message: STATUS_DEFAULT_MESSAGE[500]})
    }
}
