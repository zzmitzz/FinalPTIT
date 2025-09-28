import {isValidObjectId} from 'mongoose'
import {Registration} from '@/models'
import {abort} from '@/utils/helpers'

export async function verifyRegistrationId(req, res, next) {
    if (isValidObjectId(req.params.registrationId)) {
        const registration = await Registration.findById(req.params.registrationId)
        if (registration) {
            req.registration = registration
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy người đăng ký sự kiện.')
}
