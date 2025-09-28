import { Organizer } from '@/models'
import {abort} from '@/utils/helpers'
import { isValidObjectId } from 'mongoose'

export const checkOrganizerId = async function (req, res, next) {
    const _id = req.params.organizerId

    if (isValidObjectId(_id)) {
        const organizer = await Organizer.findOne({_id, deleted: false})
        if (organizer) {
            req.organizer = organizer
            return next()
        }
    }

    abort(404, 'Đối tác không tồn tại hoặc đã bị xóa.')
}
