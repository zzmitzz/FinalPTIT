import {LINK_RESET_PASSWORD_URL, TOKEN_TYPE} from '@/configs'
import {abort, generateToken, getToken} from '@/utils/helpers'
import * as registrationAuthService from '@/app/services/registrations/auth.service'

export async function login(req, res) {
    const validLogin = await registrationAuthService.checkValidLogin(req.body)

    if (validLogin) {
        res.jsonify(registrationAuthService.authToken(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function register(req, res) {
    const newUser = await registrationAuthService.register(req.body)
    
    const result = registrationAuthService.authToken(newUser)
    res.status(201).jsonify(result, 'Đăng ký thành công.')
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await registrationAuthService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const result = await registrationAuthService.profile(req.currentRegistration._id)
    res.jsonify(result)
}

export async function updateProfile(req, res) {
    await registrationAuthService.updateProfile(req.currentRegistration, req.body)
    res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
}

export async function changePassword(req, res) {
    // Verify old password
    const registration = await registrationAuthService.profile(req.currentRegistration._id)
    const validPassword = await registrationAuthService.checkValidLogin({
        email: registration.email,
        password: req.body.password,
    })
    
    if (!validPassword) {
        abort(400, 'Mật khẩu cũ không chính xác.')
    }
    
    await registrationAuthService.resetPassword(req.currentRegistration._id, req.body.new_password)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

export function forgotPassword(req, res) {
    const token = generateToken(
        {user_id: req.currentRegistration._id},
        TOKEN_TYPE.FORGOT_PASSWORD,
        600
    )
    res.sendMail(
        req.currentRegistration.email,
        'Quên mật khẩu',
        'emails/forgot-password',
        {
            name: req.currentRegistration.full_name || req.currentRegistration.email,
            linkResetPassword: `${LINK_RESET_PASSWORD_URL}?token=${encodeURIComponent(token)}`,
        }
    )
    res.status(200).jsonify('Yêu cầu lấy lại mật khẩu thành công! Vui lòng kiểm tra email của bạn.')
}

export async function resetPassword(req, res) {
    await registrationAuthService.resetPassword(req.currentRegistration._id, req.body.new_password)
    await registrationAuthService.blockToken(req.params.token)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

