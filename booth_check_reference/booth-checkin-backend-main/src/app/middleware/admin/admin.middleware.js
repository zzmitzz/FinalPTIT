import {abort} from '@/utils/helpers'
import { Admin } from '@/models'
import { isValidObjectId } from 'mongoose'

export const checkAdminId = async function (req, res, next) {
    const _id = req.params.adminId

    if (isValidObjectId(_id)) {
        const admin = await Admin.findOne({_id, deleted: false, is_protected: false})
        if (admin) {
            req.admin = admin
            return next()
        }
    }

    abort(404, 'Người dùng không tồn tại hoặc đã bị xóa.')
}
