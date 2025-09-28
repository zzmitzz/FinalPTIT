import {isValidObjectId} from 'mongoose'
import {abort} from '@/utils/helpers'
import Booth from '@/models/booth'

export const checkBoothId = async function (req, res, next) {
    const _id = req.params.boothId
    if (isValidObjectId(_id)) {
        const booth = await Booth.findById(_id)
        if (booth) {
            req.booth = booth
            return next()
        }
    }

    abort(404, 'Booth Check In không tồn tại hoặc đã bị xóa.')
}
