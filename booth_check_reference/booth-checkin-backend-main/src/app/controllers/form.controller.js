import * as formService from '@/app/services/form.service'
import * as registrationService from '@/app/services/registration.service'
import * as faceRecognizeService from '@/app/services/third-party/face-recognize.service'
import {SOCKET_EVENT, db} from '@/configs'
import io from '@/socket.io'
import {FileUpload} from '@/utils/classes'
import {abort} from '@/utils/helpers'
import {generateQRCheckInImage} from '../services/qr.service'

export async function readItem(req, res) {
    const result = await formService.readForm(req.form)
    res.jsonify(result)
}

export async function submitForm(req, res) {
    try {
        if (req.faceImageBase64) {
            const errorCode = await faceRecognizeService.addUser({
                registration_id: req.registration._id,
                avatar_base64: req.faceImageBase64,
                event_id: req.registration.event_id,
            })
            if (errorCode) {
                const {API_ERROR_CODE} = faceRecognizeService
                let message
                switch (errorCode) {
                    case API_ERROR_CODE.NO_FACE_FOUND:
                        message = 'Không có khuôn mặt nào được nhận diện. Vui lòng dùng ảnh khác.'
                        break
                    case API_ERROR_CODE.DUPLICATE_USER_REGISTRATION:
                        message = 'Khuôn mặt đã tồn tại. Vui lòng thử lại với một khuôn mặt khác.'
                        break

                    default:
                        message = 'Tệp tải lên không hợp lệ. Không thể sử dụng tệp này.'
                        break
                }
                abort(400, {2: message})
            }
        }
        await db.transaction(async function (session) {
            const result = await registrationService.registerToJoinTheEvent(
                session,
                req.registration,
                req.formFields
            )

            io.of(`/events/${req.registration.event_id}`)
                .emit(SOCKET_EVENT.REGISTRANT.REGISTER, result)
            io.of(`/admin/events/${req.registration.event_id}`)
                .emit(SOCKET_EVENT.REGISTRANT.REGISTER, result)
            io.of(`/booth/event/${req.registration.event_id}`)
                .emit(SOCKET_EVENT.REGISTRANT.REGISTER, result)

            const qrImage = await generateQRCheckInImage('base64', {
                registrationId: result.registration._id,
                registrationName: result.registration.response[0].response,
                registrationPhone: result.registration.response[1].response,
            })
            res.status(201).jsonify({qr_image: qrImage})
        })
    } catch (error) {
        for (const filePath of req.files_saved) {
            FileUpload.remove(filePath)
        }
        throw error
    }
}
