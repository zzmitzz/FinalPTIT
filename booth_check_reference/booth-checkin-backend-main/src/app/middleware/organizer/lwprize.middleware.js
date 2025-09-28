import LwPrize from '@/models/lucky_wheel_flow/lucky_wheel_prize'
import { abort } from '@/utils/helpers'
import { isValidObjectId } from 'mongoose'

export async function verifyPrizeOfEvent(req, res, next) {
    if (isValidObjectId(req.params.eventId)) {
        const prize = await LwPrize.findOne({
            _id: req.params.prizeId,
            event_id: req.params.eventId,
        })
        if (prize) {
            req.lwPrize = prize
            next()
            return
        }
    }
    abort(404, 'Không tìm quà trong sự kiện này.')
}