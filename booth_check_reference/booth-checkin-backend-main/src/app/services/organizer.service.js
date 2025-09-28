import {
    LINK_ORGANIZER_CREATE_SUCCESS,
    LINK_ORGANIZER_RESET_PASSWORD_URL,
    LINK_STATIC_URL,
    LOGIN_EXPIRE_IN,
    TOKEN_TYPE,
    cache,
} from '@/configs'
import {EVENT_STATUS, Event, Organizer, Registration} from '@/models'
import {generateToken, sendMail} from '@/utils/helpers'
import jwt from 'jsonwebtoken'
import moment from 'moment'

export const organizerTokenBlocklist = cache.create('organizer-token-block-list')

export async function checkValidLogin({email, password}) {
    const organizer = await Organizer.findOne({
        email: email,
        deleted: false,
    })

    if (organizer) {
        const verified = organizer.verifyPassword(password)
        if (verified) {
            return organizer
        }
    }

    return false
}

export function authToken(organizer) {
    const accessToken = generateToken(
        {organizer_id: organizer._id},
        TOKEN_TYPE.AUTHORIZATION,
        LOGIN_EXPIRE_IN
    )
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await organizerTokenBlocklist.set(token, 1, expiresIn - now)
}

export async function profile(organizerId) {
    const organizer = await Organizer.findOne({_id: organizerId, deleted: false})
    return organizer
}

export async function updateProfile(currentOrganizer, {name, phone}) {
    currentOrganizer.name = name
    currentOrganizer.phone = phone ? phone : currentOrganizer.phone

    await currentOrganizer.save()
}

export async function sendMailForgotPassword(currentOrganizer) {
    const token = generateToken({organizer_id: currentOrganizer._id}, TOKEN_TYPE.FORGOT_PASSWORD, 600)
    sendMail({
        to: currentOrganizer.email,
        subject: 'Lấy Lại Mật Khẩu Đăng Nhập',
        template: 'emails/forgot-password.html',
        data: {
            name: currentOrganizer.name,
            linkResetPassword: `${LINK_ORGANIZER_RESET_PASSWORD_URL}?token=${encodeURIComponent(token)}`,
            linkLogo: LINK_STATIC_URL + 'logo-event-recovered.png',
        },
    })
}

export async function create(session, data) {
    const organizer = new Organizer(data)
    await organizer.save({session})
    sendMail({
        to: data.email,
        subject: 'Xác Nhận Đăng Ký Đối Tác Thành Công và Thông Tin Đăng Nhập',
        template: 'emails/create-organizer.html',
        data: {
            name: data.name,
            email: data.email,
            password: data.password,
            linkOrganizerLogin: LINK_ORGANIZER_CREATE_SUCCESS,
            linkLogo: LINK_STATIC_URL + 'logo-event-recovered.png'
        }
    })
    return organizer
}

export async function getList({q, page, per_page, field, sort_order}) {
    q = q ? {$regex: q, $options: 'i'} : null

    const filter = {
        deleted: false,
        ...(q && {$or: [{name: q}, {email: q}, {phone: q}]}),
    }

    const organizers = await Organizer.find(filter, {password: 0, deleted: 0})
        .skip((page - 1) * per_page)
        .limit(per_page)
        .sort({[field]: sort_order})
        .lean()

    const total = await Organizer.countDocuments(filter)
    return {total, page, per_page, organizers}
}

export async function update(session, organizer, {name, email, phone}) {
    organizer.name = name
    organizer.email = email
    organizer.phone = phone
    await organizer.save({session})
    return organizer
}

export async function changePassword(session, organizer, {password}) {
    organizer.password = password
    await organizer.save({session})
    return organizer
}

export async function deleteItem(session, organizer) {
    organizer.deleted = true
    await organizer.save({session})
    return organizer
}

export async function getStatistical(organizer) {
    const now = Date.now()
    const organizedEventFilter = {
        deleted: false,
        organizer_id: organizer._id,
        status: EVENT_STATUS.APPROVED,
        end_time: {$lt: now},
    }
    const organizedEvent = await Event.countDocuments(organizedEventFilter)

    const eventIsOpenFilter = {
        deleted: false,
        organizer_id: organizer._id,
        status: EVENT_STATUS.APPROVED,
        start_time: {$lte: now},
        end_time: {$gte: now},
    }

    const eventIsOpen = await Event.countDocuments(eventIsOpenFilter)

    const countRegistrations = await Registration.aggregate([
        {
            $lookup: {
                from: 'events',
                localField: 'event_id',
                foreignField: '_id',
                as: 'event_details',
            },
        },
        {
            $unwind: '$event_details',
        },
        {
            $match: {
                'event_details.organizer_id': organizer._id,
            },
        },
        {
            $group: {
                _id: null,
                totalRegistrations: {$sum: 1},
            },
        },
    ])

    return {
        organizedEvent,
        eventIsOpen,
        totalRegistrations: countRegistrations.length > 0 ? countRegistrations[0].totalRegistrations : 0
    }
}
