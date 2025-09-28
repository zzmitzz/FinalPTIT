import {LINK_ADMIN_RESET_PASSWORD_URL, LINK_STATIC_URL, LOGIN_EXPIRE_IN, TOKEN_TYPE,cache} from '@/configs'
import {Admin, Permission, Role} from '@/models'
import {generateToken, sendMail} from '@/utils/helpers'
import jwt from 'jsonwebtoken'
import moment from 'moment'

export const adminTokenBlocklist = cache.create('admin-token-block-list')

export async function checkValidLogin({email, password}) {
    const admin = await Admin.findOne({
        email: email,
        deleted: false,
    })

    if (admin) {
        const verified = admin.verifyPassword(password)
        if (verified) {
            return admin
        }
    }

    return false
}

export function authToken(admin) {
    const accessToken = generateToken({admin_id: admin._id}, TOKEN_TYPE.AUTHORIZATION, LOGIN_EXPIRE_IN)
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
    await adminTokenBlocklist.set(token, 1, expiresIn - now)
}

export async function profile(adminId) {
    const admin = await Admin.findOne({_id: adminId, deleted: false})
        .select('-password -is_protected -deleted -created_at -updated_at')
        .lean()
    const roles = await Role.find({_id: {$in: admin.role_ids}})
    const permissions = await Permission.find({
        _id: {$in: roles.map((role) => role.permission_ids).flat()},
    })
    admin.permissions = permissions.map(({code}) => code)
    delete admin.role_ids

    return admin
}

export async function updateProfile(session, currentAdmin, {name, phone}) {
    currentAdmin.name = name
    currentAdmin.phone = phone ? phone : currentAdmin.phone

    await currentAdmin.save({session})
}

export async function sendMailForgotPassword(currentAdmin) {
    const token = generateToken({admin_id: currentAdmin._id}, TOKEN_TYPE.FORGOT_PASSWORD, 600)
    sendMail({
        to: currentAdmin.email,
        subject: 'Lấy lại mật khẩu đăng nhập',
        template: 'emails/forgot-password.html',
        data: {
            name: currentAdmin.name,
            linkResetPassword: `${LINK_ADMIN_RESET_PASSWORD_URL}?token=${encodeURIComponent(token)}`,
            linkLogo: LINK_STATIC_URL + 'logo-event-recovered.png',
        },
    })
}

export async function getList({q, page, per_page, field, sort_order, role}) {

    q = q ? {$regex: q, $options: 'i'} : null
    page = page ? parseInt(page) : 1
    per_page = per_page ? parseInt(per_page) : 20
    field = field || 'created_at'
    sort_order = sort_order ? (sort_order === 'asc' ? 1 : -1) : -1
    role = role ? role.split(',') : null

    const filter = {
        deleted: false,
        is_protected: false,
        ...(q && {$or: [{name: q}, {email: q}, {phone: q}]}),
        ...(role && {role_ids : {$in: role}})
    }

    const admins = await Admin.find(filter, {password: 0, deleted: 0})
        .skip((page - 1) * per_page)
        .limit(per_page)
        .sort({[field]: sort_order})
        .lean()

    const roleIds = admins.flatMap(admin => admin.role_ids)
    const roles = await Role.find({_id: {$in: roleIds}}, {_id: 1, name: 1}).lean()

    const rolesMap = roles.reduce((acc, role) => {
        acc[role._id] = role
        return acc
    }, {})

    const adminsWithRoles = admins.map(admin => {
        const populatedRoles = admin.role_ids?.map(roleId => rolesMap[roleId] || roleId)
        return {...admin, role_ids: populatedRoles}
    })

    const total = await Admin.countDocuments(filter)
    return {total, page, per_page, admins: adminsWithRoles}
}

export async function create(session, {name, email, password, phone, role_ids}) {
    const admin = new Admin({
        name,
        email,
        phone: phone || '',
        password: password,
        role_ids: role_ids || [],
    })

    await admin.save({session})

    return admin
}

export async function updateAdmin(session, admin, {name, email, phone, role_ids}) {
    admin.name = name
    admin.email = email
    admin.phone = phone || ''
    admin.role_ids = role_ids || []

    await admin.save({session})

    return admin
}

export async function remove(session, admin) {
    admin.deleted = true

    await admin.save({session})
}

export async function changePassword(session, admin, password) {
    admin.password = password

    await admin.save({session})
}
