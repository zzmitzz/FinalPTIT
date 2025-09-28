import mongoose from 'mongoose'
import mongooseLeanDefaults from 'mongoose-lean-defaults'

export default function createModel(name, collection, definition, options) {
    const schema = new mongoose.Schema(definition, {
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
        versionKey: false,
        ...(options ?? {}),
    })
    schema.plugin(mongooseLeanDefaults)
    return mongoose.model(name, schema, collection)
}

export const {ObjectId} = mongoose.Types

export const {Mixed} = mongoose.Schema.Types

export const PERMISSION = {
    DASHBOARD: 'dashboard',

    // admin management
    LIST_ADMIN: 'list-admin',
    CREATE_ADMIN: 'create-admin',
    UPDATE_ADMIN: 'update-admin',
    DELETE_ADMIN: 'delete-admin',

    // role management
    LIST_ROLE: 'list-role',
    CREATE_ROLE: 'create-role',
    UPDATE_ROLE: 'update-role',
    DELETE_ROLE: 'delete-role',

    // permission management
    UPDATE_PERMISSION_FOR_ROLE: 'update-permission-for-role',

    // organizer management
    LIST_ORGANIZER: 'list-organizer',
    CREATE_ORGANIZER: 'create-organizer',
    UPDATE_ORGANIZER: 'update-organizer',
    DELETE_ORGANIZER: 'delete-organizer',
    READ_ORGANIZER: 'read-organizer',

    // event management
    LIST_EVENT: 'list-event',
    UPDATE_EVENT: 'update-event',
    READ_EVENT: 'read-event',

    // booth management
    LIST_BOOTH: 'list-booth',
    CREATE_BOOTH: 'create-booth',
    UPDATE_BOOTH: 'update-booth',
    DELETE_BOOTH: 'delete-booth',
    ASSIGN_BOOTH_TO_EVENT: 'assign-booth-to-event',
}

export const EVENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    CANCELLED: 'CANCELLED',
}
export const EMAIL_JOB_STATUS = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    FAILED: 'FAILED',
    RETRY: 'RETRY',
}
export const EVENT_STATE = {
    PENDING: 'PENDING',
    NOT_STARTED_YET: 'NOT_STARTED_YET',
    ON_GOING: 'ON_GOING',
    ENDED: 'ENDED',
    LOCKED: 'LOCKED',
    CANCELLED: 'CANCELLED',
}

export const EVENT_CHECK_IN_TYPE = {
    QR_CODE: 'QR_CODE',
    FACE_ID: 'FACE_ID',
}

export const EVENT_MINI_GAME = {
    LUCKY_WHEEL: 'LUCKY_WHEEL',
}
export const LUCKY_WHEEL_TYPE = {
    LUCKY_PRIZE: 'LUCKY_PRIZE',
    LUCKY_CHECKED_IN: 'LUCKY_CHECKED_IN',
}
export const OPTION_FIELD = {
    RADIO: 'RADIO',
    CHECKBOX: 'CHECKBOX',
}

export const DATE_FIELD = {
    DATE: 'DATE',
}

export const TIME_FIELD = {
    TIME_MINUTE: 'TIME_MINUTE',
}

export const RANGE_FIELD = {
    TEXT: 'TEXT',
    TEXTAREA: 'TEXTAREA',
    NUMBER: 'NUMBER',
    ...DATE_FIELD,
    ...TIME_FIELD,
}

export const FIELD_TYPE = {
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    FILE: 'FILE',
    FACE_ID: 'FACE_ID',
    ...OPTION_FIELD,
    ...RANGE_FIELD,
}

export const UNIT_OF_TIME = {
    DATE_YEAR: 'year',
    DATE_QUARTER: 'quarter',
    DATE_MONTH: 'month',
    DATE_WEEK: 'week',
    DATE: 'day',
    DATE_HOUR: 'hour',
    DATE_MINUTE: 'minute',
    DATE_TIME: 'second',

    RANGE_DATE_YEAR: 'year',
    RANGE_DATE_QUARTER: 'quarter',
    RANGE_DATE_MONTH: 'month',
    RANGE_DATE_WEEK: 'week',
    RANGE_DATE: 'day',
    RANGE_DATE_HOUR: 'hour',
    RANGE_DATE_MINUTE: 'minute',
    RANGE_DATE_TIME: 'second',
}

export const LUCKY_WHEEL_CONDITIONS = {
    ALL_CHECK_INS: 'ALL_CHECK_INS',
    SINGLE_CHECK_IN: 'SINGLE_CHECK_IN',
}

