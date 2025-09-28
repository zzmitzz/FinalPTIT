import {FORM_FIELD_TEMPLATE, LINK_STATIC_URL} from '@/configs'
import {EVENT_CHECK_IN_TYPE, Form, FormField} from '@/models'
import _ from 'lodash'

export async function readForm(form) {
    const detail = await Form.findOne({_id: form._id})
        .populate({
            path: 'event',
            select: 'name logo thumbnail description start_time end_time location organizing_unit co_organizing_unit mini_game ',
        })
        .populate({
            path: 'fields',
            select: '-created_at -updated_at',
            options: {sort: {position: 1}},
        })
        .lean()
    detail.event.thumbnail = detail.event.thumbnail && LINK_STATIC_URL + detail.event.thumbnail
    detail.event.logo = _.isArray(detail.event.logo)
        ? detail.event.logo.map((img) => LINK_STATIC_URL + img)
        : []

    return detail
}

export async function saveForm(session, event, {title, description, is_public, fields}) {
    let form = await Form.findOne({event_id: event._id}).session(session)
    if (!form) {
        form = new Form({event_id: event._id})
    }
    form.title = title
    form.description = description
    form.is_public = is_public
    fields = [
        FORM_FIELD_TEMPLATE.FULL_NAME,
        FORM_FIELD_TEMPLATE.PHONE,
        FORM_FIELD_TEMPLATE.EMAIL,
        ...(event.check_in_type.includes(EVENT_CHECK_IN_TYPE.FACE_ID) ? [FORM_FIELD_TEMPLATE.FACE_ID] : []),
        ...fields,
    ]
    fields = fields.map(async function (field, position) {
        field.required = field.is_primary_key || field.required
        field.field_options = _.isUndefined(field.field_options) ? [] : field.field_options
        field.field_range = _.isUndefined(field.field_range) ? {min: null, max: null} : field.field_range
        field.field_extensions = _.isUndefined(field.field_extensions) ? [] : field.field_extensions
        if (
            !_.isNull(field.field_range.min) &&
            !_.isNull(field.field_range.max) &&
            field.field_range.min > field.field_range.max
        ) {
            [field.field_range.min, field.field_range.max] = [field.field_range.max, field.field_range.min]
        }
        field.field_extensions = _.isUndefined(field.field_extensions) ? [] : field.field_extensions

        const formField = await FormField.findOneAndUpdate(
            {form_id: form._id, position},
            {$set: field},
            {upsert: true, new: true, session}
        )
        return formField
    })
    await form.save({session})
    fields = await Promise.all(fields)
    await FormField.deleteMany({form_id: form._id, position: {$gte: fields.length}}, {session})
}
