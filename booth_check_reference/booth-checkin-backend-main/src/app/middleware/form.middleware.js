import {
    EVENT_STATUS,
    FIELD_TYPE,
    Form,
    FormField,
    Registration,
    UNIT_OF_TIME,
} from '@/models'
import {FileUpload} from '@/utils/classes'
import {abort, generateSchema, validateAsync} from '@/utils/helpers'
import Joi from 'joi'
import _ from 'lodash'
import moment from 'moment'
import {isValidObjectId} from 'mongoose'

export async function verifyFormId(req, res, next) {
    if (isValidObjectId(req.params.formId)) {
        const form = await Form.findOne({_id: req.params.formId, is_public: true}).populate('event')
        if (
            form &&
            form.event &&
            !form.event.deleted &&
            !form.event.is_locked &&
            form.event.status === EVENT_STATUS.APPROVED
        ) {
            req.form = form
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy biểu mẫu.')
}

export function canSubmitForm(req, res, next) {
    if (moment().isAfter(req.form.event.end_time)) {
        abort(403, 'Không thể đăng ký tham gia sự kiện đã kết thúc.')
    }
    next()
}

export async function validateSubmitFormRequest(req, res, next) {
    const formFields = await FormField.find({form_id: req.form._id}).sort({position: 1}).lean()
    const schema = formFields.reduce(function (sch, field) {
        sch[field.position] = generateSchema(field)
        return sch
    }, {})

    const [value, error] = await validateAsync(Joi.object(schema), req.body, req)

    if (!_.isEmpty(error)) {
        abort(400, error)
    }

    req.files_saved = []
    const registration = new Registration({
        event_id: req.form.event_id,
        form_id: req.form._id,
    })
    req.registration = registration
    req.formFields = formFields.map(function ({
        is_primary_key,
        field_label,
        field_description,
        field_type,
        field_options,
        field_has_other_option,
        field_range,
        field_extensions,
        required,
        position,
    }) {
        let response = value[position]
        if (field_type.startsWith('DATE') && _.isNumber(response)) {
            response = moment.unix(response).startOf(UNIT_OF_TIME[field_type]).toDate()
        } else if (field_type.startsWith('RANGE_DATE') && _.isArray(response)) {
            response = [
                moment.unix(response[0]).startOf(UNIT_OF_TIME[field_type]).toDate(),
                moment.unix(response[1]).endOf(UNIT_OF_TIME[field_type]).toDate(),
            ]
        } else if (
            [FIELD_TYPE.FILE, FIELD_TYPE.FACE_ID].includes(field_type) &&
            response instanceof FileUpload
        ) {
            if (field_type === FIELD_TYPE.FACE_ID) {
                req.faceImageBase64 = response.base64()
            }

            response = response.save()
            req.files_saved.push(response)
        }
        return {
            event_id: req.form.event_id,
            form_id: req.form._id,
            registration_id: registration._id,
            position,
            is_primary_key,
            field_label,
            field_description,
            field_type,
            field_options,
            field_has_other_option,
            field_range,
            field_extensions,
            required,
            response: _.isString(response) && _.isEmpty(response) ? null : response,
        }
    })
    next()
}
