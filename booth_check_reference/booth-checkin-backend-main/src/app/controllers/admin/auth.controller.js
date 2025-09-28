import {abort, getToken} from '@/utils/helpers'
import * as adminService from '@/app/services/admin.service'
import {db} from '@/configs'

export async function login(req, res) {
    const validLogin = await adminService.checkValidLogin(req.body)

    if (validLogin) {
        res.jsonify(adminService.authToken(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await adminService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const result = await adminService.profile(req.currentAdmin._id)
    res.jsonify(result)
}

export async function updateProfile(req, res) {
    await db.transaction(async function (session) {
        await adminService.updateProfile(session, req.currentAdmin, req.body)
        res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
    })
}

export async function changePassword(req, res) {
    req.currentAdmin.password = req.body.new_password
    await req.currentAdmin.save()
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

export async function forgotPassword(req, res) {
    await adminService.sendMailForgotPassword(req.currentAdmin)
    res.status(200).jsonify('Yêu cầu lấy lại mật khẩu thành công! Vui lòng kiểm tra email của bạn.')
}

export async function resetPassword(req, res) {
    await db.transaction(async function (session) {
        req.currentAdmin.password = req.body.new_password
        await req.currentAdmin.save({session})
        await adminService.blockToken(req.params.token)
        res.status(201).jsonify('Cập nhật mật khẩu thành công.')
    })
}
