import {LINK_RESET_PASSWORD_URL, TOKEN_TYPE, LOGIN_EXPIRE_IN} from '@/configs'
import {abort, generateToken, getToken} from '@/utils/helpers'
import * as organizerAuthService from '@/app/services/organizer/organizer_auth.service'



export async function login(req, res) {
    const validLogin = await organizerAuthService.checkValidLogin(req.body)

    if (validLogin) {
        res.jsonify(organizerAuthService.authToken(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function register(req, res) {
    const newUser = await organizerAuthService.register(req.body)
    const result = organizerAuthService.authToken(newUser)
    res.status(201).jsonify(result, 'Đăng ký thành công.')
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await organizerAuthService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const result = await organizerAuthService.profile(req.currentUser._id)
    res.jsonify(result)
}

export async function updateProfile(req, res) {
    await organizerAuthService.updateProfile(req.currentUser, req.body)
    res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
}

export async function changePassword(req, res) {
    await organizerAuthService.resetPassword(req.currentUser._id, req.body.new_password)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

export function forgotPassword(req, res) {
    const token = generateToken({user_id: req.currentUser._id}, TOKEN_TYPE.FORGOT_PASSWORD, 600)
    res.sendMail(req.currentUser.email, 'Quên mật khẩu', 'emails/forgot-password', {
        name: req.currentUser.name,
        linkResetPassword: `${LINK_RESET_PASSWORD_URL}?token=${encodeURIComponent(token)}`,
    })
    res.status(200).jsonify('Yêu cầu lấy lại mật khẩu thành công! Vui lòng kiểm tra email của bạn.')
}

export async function resetPassword(req, res) {
    await organizerAuthService.resetPassword(req.currentUser._id, req.body.new_password)
    await organizerAuthService.blockToken(req.params.token)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}
