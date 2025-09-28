import path from 'path'
import short from 'short-uuid'
import dotenv from 'dotenv'
import assert from 'assert'
import _ from 'lodash'
import bytes from 'bytes'

// Loads `.env` file contents into process.env
dotenv.config()

// directory
export const SOURCE_DIR = path.dirname(__dirname)
export const APP_DIR = path.dirname(SOURCE_DIR)
export const NODE_MODULES_DIR = path.join(APP_DIR, 'node_modules')
export const PUBLIC_DIR = path.join(APP_DIR, 'public')
export const PRIVATE_DIR = path.join(APP_DIR, 'private')
export const LOG_DIR = path.join(PRIVATE_DIR, 'logs')
export const CACHE_DIR = path.join(PRIVATE_DIR, 'cache')
export const VIEW_DIR = path.join(SOURCE_DIR, 'views')

// environment
export const APP_ENV = {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
}
export const NODE_ENV = Object.values(APP_ENV).includes(process.env.NODE_ENV)
    ? process.env.NODE_ENV
    : APP_ENV.PRODUCTION

export const APP_NAME = process.env.APP_NAME
export const APP_DEBUG = NODE_ENV === APP_ENV.DEVELOPMENT
export const APP_URL_API = process.env.APP_URL_API
export const APP_URL_CLIENT = process.env.APP_URL_CLIENT
export const OTHER_URLS_CLIENT = process.env.OTHER_URLS_CLIENT
    ? JSON.parse(process.env.OTHER_URLS_CLIENT)
    : []
assert(_.isArray(OTHER_URLS_CLIENT), 'OTHER_URLS_CLIENT must be an array.')

assert(!_.isEmpty(process.env.SECRET_KEY), 'Missing SECRET_KEY. Please configure the SECRET_KEY variable for security.')
export const SECRET_KEY = process.env.SECRET_KEY

assert(!_.isEmpty(process.env.LOGIN_EXPIRE_IN), 'Missing LOGIN_EXPIRE_IN. Please configure LOGIN_EXPIRE_IN for user login expiration.')
export const LOGIN_EXPIRE_IN = process.env.LOGIN_EXPIRE_IN

export const REQUESTS_LIMIT_PER_MINUTE = parseInt(process.env.REQUESTS_LIMIT_PER_MINUTE, 10) || 1000

export const LINK_STATIC_URL = `${APP_URL_API}/static/`
export const LINK_ADMIN_RESET_PASSWORD_URL = `${APP_URL_CLIENT}/admin/reset-password`
export const LINK_ORGANIZER_RESET_PASSWORD_URL = `${APP_URL_CLIENT}/reset-password`
export const LINK_ORGANIZER_CREATE_SUCCESS = `${APP_URL_CLIENT}/login`

assert(!_.isEmpty(process.env.DB_HOST), 'Missing DB_HOST. Please configure the DB_HOST variable for database connection.')
assert(!_.isEmpty(process.env.DB_NAME), 'Missing DB_NAME. Please configure the DB_NAME variable for database connection.')
assert(!_.isEmpty(process.env.DB_AUTH_SOURCE), 'Missing DB_AUTH_SOURCE. Please configure the DB_AUTH_SOURCE variable for database connection.')
export const DATABASE_URI =
    'mongodb' +
    (process.env.DB_PORT ? '' : '+srv') +
    '://' +
    process.env.DB_HOST +
    (process.env.DB_PORT ? ':' + process.env.DB_PORT : '')
    + '?directConnection=true'
export const DB_NAME = process.env.DB_NAME
export const DB_USERNAME = process.env.DB_USERNAME
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_AUTH_SOURCE = process.env.DB_AUTH_SOURCE

assert(!_.isEmpty(process.env.MAIL_HOST), 'Missing MAIL_HOST. Please configure the MAIL_HOST variable to send mail.')
assert(!_.isEmpty(process.env.MAIL_PORT), 'Missing MAIL_PORT. Please configure the MAIL_PORT variable to send mail.')
assert(!_.isEmpty(process.env.MAIL_USERNAME), 'Missing MAIL_USERNAME. Please configure the MAIL_USERNAME variable to send mail.')
assert(!_.isEmpty(process.env.MAIL_PASSWORD), 'Missing MAIL_PASSWORD. Please configure the MAIL_PASSWORD variable to send mail.')
export const MAIL_HOST = process.env.MAIL_HOST
export const MAIL_PORT = process.env.MAIL_PORT
export const MAIL_SECURE = process.env.MAIL_SECURE === 'true'
export const MAIL_USERNAME = process.env.MAIL_USERNAME
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD
export const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS
export const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME

// Third party
assert(!_.isEmpty(process.env.FACE_RECOGNIZE_API_URL), 'Missing FACE_RECOGNIZE_API_URL. Please configure it before running the application.')
assert(!_.isEmpty(process.env.FACE_RECOGNIZE_API_KEY), 'Missing FACE_RECOGNIZE_API_KEY. Please configure it before running the application.')
assert(!_.isEmpty(process.env.FACE_RECOGNIZE_CONTENT_LIMIT), 'Missing FACE_RECOGNIZE_CONTENT_LIMIT. Please configure it before running the application.')
export const FACE_RECOGNIZE_API_URL = process.env.FACE_RECOGNIZE_API_URL
export const FACE_RECOGNIZE_API_KEY = process.env.FACE_RECOGNIZE_API_KEY
export const FACE_RECOGNIZE_CONTENT_LIMIT = bytes(process.env.FACE_RECOGNIZE_CONTENT_LIMIT)

// regex
export const VALIDATE_PHONE_REGEX = /^(0[235789])[0-9]{8}$/
export const VALIDATE_MAC_ADDRESS_REGEX = /^([0-9a-fA-F]{2}[:-]?){5}([0-9a-fA-F]{2})$/

// other
export const TOKEN_TYPE = {
    AUTHORIZATION: 'AUTHORIZATION',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD'
}
export const CRYPTO_TYPE = {
    QR_CODE: 'QR_CODE'
}
export const MAX_STRING_SIZE = 255

export const UUID_TRANSLATOR = short()

export const STATUS_DEFAULT_MESSAGE = {
    401: 'Vui lòng đăng nhập để tiếp tục.',
    403: 'Xin lỗi, bạn không được phép truy cập.',
    404: 'Đường dẫn không tồn tại.',
    429: 'Có quá nhiều yêu cầu. Vui lòng thử lại sau.',
    500: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
}

export const JOI_DEFAULT_MESSAGE = {
    // boolean
    'boolean.base': '{{#label}} sai định dạng.',

    // string
    'string.base': '{{#label}} sai định dạng.',
    'string.empty': '{{#label}} không được bỏ trống.',
    'string.min': '{{#label}} không được ít hơn {{#limit}} ký tự.',
    'string.max': '{{#label}} không được vượt quá {{#limit}} ký tự.',
    'string.pattern.base': '{{#label}} không đúng định dạng.',
    'string.email': '{{#label}} không đúng định dạng.',

    // number
    'number.base': '{{#label}} sai định dạng.',
    'number.integer': '{{#label}} sai định dạng.',
    'number.min': '{{#label}} không được nhỏ hơn {{#limit}}.',
    'number.max': '{{#label}} không được lớn hơn {{#limit}}.',

    // array
    'array.base': '{{#label}} sai định dạng.',
    'array.unique': 'Các {{#label}} không được giống nhau.',
    'array.min': '{{#label}} không được ít hơn {{#limit}} phần tử.',
    'array.max': '{{#label}} không được vượt quá {{#limit}} phần tử.',
    'array.length': '{{#label}} phải có đúng {{#limit}} phần tử.',
    'array.includesRequiredUnknowns': '{{#label}} không hợp lệ.',
    'array.includesRequiredKnowns': '{{#label}} không hợp lệ.',

    // object
    'object.base': '{{#label}} sai định dạng.',
    'object.unknown': 'Trường {#key} không được xác định.',
    'object.instance': '{{#label}} không đúng định dạng.',

    // binary
    'binary.base': '{{#label}} sai định dạng.',
    'binary.min': '{{#label}} không được ít hơn {{#limit}} bytes.',
    'binary.max': '{{#label}} không được vượt quá {{#limit}} bytes.',

    // any
    'any.only': '{{#label}} không hợp lệ.',
    'any.required': '{{#label}} không được bỏ trống.',
    'any.unknown': 'Trường {#key} không được xác định.',
    'any.invalid': '{{#label}} không hợp lệ.',
    'any.exists': '{{#label}} đã tồn tại.',
}

export const JOI_DEFAULT_OPTIONS = {
    abortEarly: false,
    errors: {
        wrap: { label: false },
        language: { 'any.exists': 'any.exists' },
    },
    externals: false,
    stripUnknown: true,
    messages: JOI_DEFAULT_MESSAGE,
}

export const SOCKET_EVENT = {
    REGISTRANT: {
        CHECK_IN: 'registrant:check-in',
        REGISTER: 'registrant:register',
        UPLOAD: 'registrant:upload',
    },
    BOOTH: {
        PING: 'booth:ping',
        ACTIVE: 'booth:active',
        INACTIVE: 'booth:inactive',
        EVENT_TRACING: 'booth:event-tracking',
        BOOTH_SETTING: 'booth:setting'
    },
}

// Added 20250522
// Last edited: 01062025

export const EMAIL_TEMPLATE_FIELDS = {
    RECEIVER_NAME: {
        field_label: 'Ho_va_ten',
        field_type: 'TEXT',
        field_range: {max: 60},
        can_edit: false,
        required: true,
    },
    EMAIL: {
        field_label: 'Email',
        field_type: 'EMAIL',
        can_edit: false,
    },
    PHONE_NUMBER: {
        field_label: 'So_dien_thoai',
        field_type: 'PHONE',
        can_edit: false,
    },
    POSITION: {
        field_label: 'Chuc_vu',
        field_type: 'TEXT',
        can_edit: false,
    },
    EVENT_NAME: {
        field_label: 'Ten_su_kien',
        field_type: 'TEXT',
        can_edit: false,
    },
    EVENT_DATE: {
        field_label: 'Ngay_su_kien',
        field_type: 'TEXT',
        can_edit: false,
    },
    EVENT_TIME: {
        field_label: 'Thoi_gian_su_kien',
        field_type: 'TEXT',
        can_edit: false,
    },
    EVENT_LOCATION: {
        field_label: 'Dia_diem_su_kien',
        field_type: 'TEXT',
        can_edit: false,
    },
    CURRENT_DATE: {
        field_label: 'Ngay_hien_tai',
        field_type: 'TEXT',
        can_edit: false,
    },
    SYSTEM_NAME: {
        field_label: 'Ten_he_thong',
        field_type: 'TEXT',
        can_edit: false,
    }
}

// End 20250522

export const FORM_FIELD_TEMPLATE = {
    FULL_NAME: {
        field_label: 'Họ và tên',
        field_type: 'TEXT',
        field_range: { max: 60 },
        can_edit: false,
        required: true,
    },
    PHONE: {
        field_label: 'Số điện thoại',
        field_type: 'PHONE',
        is_primary_key: true,
        can_edit: false,
    },
    EMAIL: {
        field_label: 'Email',
        field_type: 'EMAIL',
        is_primary_key: true,
        required: true,
        can_edit: false,
    },
    FACE_ID: {
        field_label: 'Ảnh cá nhân',
        field_description:
            'Sự kiện sử dụng công nghệ check-in bằng nhận diện khuôn mặt, vui lòng cung cấp ảnh khuôn mặt rõ để thuận tiện trong quá trình check-in sự kiện',
        field_type: 'FACE_ID',
        field_extensions: ['.png', '.jpeg', '.jpg'],
        can_edit: false,
        required: true,
    },
}
