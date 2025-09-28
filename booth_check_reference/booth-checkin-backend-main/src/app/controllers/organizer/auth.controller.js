import {abort, getToken} from '@/utils/helpers'
import * as organizerService from '@/app/services/organizer.service'

export async function login(req, res) {
    const validLogin = await organizerService.checkValidLogin(req.body)

    if (validLogin) {
        res.jsonify(organizerService.authToken(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await organizerService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const result = await organizerService.profile(req.currentOrganizer._id)
    res.jsonify(result)
}

export async function updateProfile(req, res) {
    await organizerService.updateProfile(req.currentOrganizer, req.body)
    res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
}

export async function changePassword(req, res) {
    req.currentOrganizer.password = req.body.new_password
    await req.currentOrganizer.save()
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

export async function forgotPassword(req, res) {
    await organizerService.sendMailForgotPassword(req.currentOrganizer)
    res.status(200).jsonify('Yêu cầu lấy lại mật khẩu thành công! Vui lòng kiểm tra email của bạn.')
}

export async function resetPassword(req, res) {
    req.currentOrganizer.password = req.body.new_password
    await req.currentOrganizer.save()
    await organizerService.blockToken(req.params.token)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}
