import {Booth} from '@/models'
import {abort} from '@/utils/helpers'
import {isValidObjectId} from 'mongoose'

export const checkBoothId = async function (req, res, next) {
    const _id = req.params.boothId
    if (isValidObjectId(_id)) {
        const booth = await Booth.findById(_id).populate('event')
        if (req.currentOrganizer._id.equals(booth?.event?.organizer_id) ) {
            req.booth = booth
            return next()
        }
    }

    abort(404, 'Booth Check In không tồn tại hoặc đã bị xóa.')
}
