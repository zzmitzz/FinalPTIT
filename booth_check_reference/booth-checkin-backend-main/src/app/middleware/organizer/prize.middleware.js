import { Prize } from '@/models'
import {abort} from '@/utils/helpers'
import {isValidObjectId} from 'mongoose'

export async function checkPrizeId(req, res, next) {
    if (isValidObjectId(req.params.prizeId)) {
        const prize = await Prize.findById(req.params.prizeId).populate('event')
        if (prize) {
            if (!req.currentOrganizer._id.equals(prize.event.organizer_id)) {
                abort(403)
            }
            req.prize = prize
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy phần quà.')
}
