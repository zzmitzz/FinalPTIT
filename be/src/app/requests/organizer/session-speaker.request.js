import Joi from 'joi'
import * as sessionRepo from '@/db/session_repository'
import * as speakerRepo from '@/db/speaker_repository'
import * as sessionSpeakerRepo from '@/db/session_speaker_repository'
import {AsyncValidate} from '@/utils/classes'

export const addSpeakerToSession = Joi.object({
    session_id: Joi.number()
        .integer()
        .required()
        .label('Session ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const session = await sessionRepo.findSessionById(value)
                    return session ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
    speaker_id: Joi.number()
        .integer()
        .required()
        .label('Speaker ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const speaker = await speakerRepo.findSpeakerById(value)
                    return speaker ? value : helpers.message('{{#label}} không tồn tại.')
                })
        )
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const {session_id} = helpers.state.ancestors[0]
                    if (!session_id) return value

                    const existing = await sessionSpeakerRepo.findSessionSpeakerByIds(session_id, value)
                    return existing ? helpers.message('Diễn giả đã được thêm vào phiên này.') : value
                })
        ),
    role: Joi.string()
        .trim()
        .max(255)
        .optional()
        .default('speaker')
        .label('Vai trò'),
    speaking_order: Joi.number()
        .integer()
        .min(1)
        .optional()
        .label('Thứ tự phát biểu'),
    speaking_duration_minutes: Joi.number()
        .integer()
        .min(1)
        .optional()
        .label('Thời lượng phát biểu (phút)'),
    notes: Joi.string()
        .trim()
        .max(5000)
        .allow('')
        .optional()
        .label('Ghi chú'),
})

export const updateSessionSpeaker = Joi.object({
    role: Joi.string()
        .trim()
        .max(255)
        .optional()
        .label('Vai trò'),
    speaking_order: Joi.number()
        .integer()
        .min(1)
        .optional()
        .label('Thứ tự phát biểu'),
    speaking_duration_minutes: Joi.number()
        .integer()
        .min(1)
        .optional()
        .label('Thời lượng phát biểu (phút)'),
    notes: Joi.string()
        .trim()
        .max(5000)
        .allow('')
        .optional()
        .label('Ghi chú'),
})

export const getSessionSpeakers = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .label('Trang'),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .label('Số lượng mỗi trang'),
})

