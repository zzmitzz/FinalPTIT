import { EVENT_STATUS, Event, Form, Registration } from '@/models'
import { abort } from '@/utils/helpers'
import moment from 'moment'
import { isValidObjectId } from 'mongoose'
import * as xlsxService from '@/app/services/xlsx.service'
import _ from 'lodash'

export async function verifyEventId(req, res, next) {
    if (isValidObjectId(req.params.eventId)) {
        const event = await Event.findOne({
            _id: req.params.eventId,
            deleted: false,
            organizer_id: req.currentOrganizer._id,
        })
        if (event) {
            req.event = event
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy sự kiện.')
}

export async function verifyRegistrationId(req, res, next) {
    if (isValidObjectId(req.params.registrationId)) {
        try {
            const registration = await Registration.findOne({
                _id: req.params.registrationId,
                event_id: req.event._id
            })

            if (registration) {
                req.registration = registration
                next()
                return
            }
        } catch (error) {
            abort(404, 'Không tìm thấy đăng ký.')
        }
    }
    abort(404, 'Không tìm thấy đăng ký.')
}

export function canUpdateEvent(req, res, next) {
    if (req.event.is_locked) {
        abort(403, 'Không thể cập nhật sự kiện đã bị khoá.')
    }
    if (req.event.status === EVENT_STATUS.APPROVED && moment().isSameOrAfter(req.event.start_time)) {
        abort(403, 'Không thể cập nhật sự kiện đang hoặc đã diễn ra.')
    }
    next()
}


export function canDeleteEvent(req, res, next) {
    if (req.event.is_locked) {
        abort(403, 'Không thể xoá sự kiện đã bị khoá.')
    }
    if (req.event.status === EVENT_STATUS.APPROVED) {
        abort(403, 'Không thể xoá sự kiện đã phê duyệt.')
    }
    next()
}

export function canUpdateForm(req, res, next) {
    if (req.event.is_locked) {
        abort(403, 'Không thể cập nhật biểu mẫu khi sự kiện đã bị khoá.')
    }
    if (req.event.status === EVENT_STATUS.APPROVED && moment().isSameOrAfter(req.event.start_time)) {
        abort(403, 'Không thể cập nhật biểu mẫu khi sự kiện đang hoặc đã diễn ra.')
    }
    next()
}

export async function canPublicForm(req, res, next) {
    const form = await Form.findOne({ event_id: req.event._id }).populate('fields')
    if (!form || form.fields.length < 1) {
        abort(404, 'Sự kiện không có biểu mẫu.')
    }
    req.form = form
    next()
}

export async function canExportTemplateExcelFile(req, res, next) {
    const form = await Form.findOne({ event_id: req.event._id }).populate('fields')
    if (!form || form.fields.length < 1) {
        abort(403, 'Không thể xuất tệp Excel khi chưa tạo biểu mẫu.')
    }
    req.formFields = form.fields.sort((a, b) => a.position - b.position)
    next()
}

export async function canUploadRegistrationExcelData(req, res, next) {
    const form = await Form.findOne({ event_id: req.event._id }).populate('fields')
    if (!form || form.fields.length < 1) {
        abort(403, 'Không thể tải tệp lên khi chưa tạo biểu mẫu.')
    }
    form.fields.sort((a, b) => a.position - b.position)
    req.form = form
    next()
}

export async function validateRegistrationExcelData(req, res, next) {
    const {
        registrationData: { registrations, registrationResponses },
        emails,
        error,
    } = await xlsxService.convertXlsxToRegistrationData(req.form, req.body.file.buffer)
    if (!_.isEmpty(error)) {
        abort(400, error)
    }
    req.emails = emails
    req.registrations = registrations
    req.registrationResponses = registrationResponses
    next()
}

export function checkMiniGameCode(req, res, next) {
    if (!req.event.mini_game.includes(req.params.MINI_GAME_CODE)) {
        abort(404)
    }
    next()
}
