import { LINK_RESET_PASSWORD_URL, LINK_VERIFY_EMAIL_URL, TOKEN_TYPE } from '@/configs'
import { abort, generateToken, getToken } from '@/utils/helpers'
import * as registrationAuthService from '@/app/services/registrations/auth.service'
import { EmailService } from '@/app/services/email.service'
const buildStaticUrl = (value) => {
    if (!value || typeof value !== 'string') return value
    if (/^https?:\/\//i.test(value)) return value
    const base = (process.env.APP_URL_API || '').replace(/\/+$/, '')
    const path = value.startsWith('/') ? value : `/${value}`
    const withStatic = path.startsWith('/static/') ? path : `/static${path}`
    return `${base}${withStatic}`
}
export async function login(req, res) {
    const validLogin = await registrationAuthService.checkValidLogin(req.body)

    if (validLogin) {
        if (!validLogin.is_active) {
            abort(403, 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực tài khoản.')
        }
        res.jsonify(registrationAuthService.authToken(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function register(req, res) {
    const newUser = await registrationAuthService.register(req.body)

    const verificationToken = generateToken(
        { user_id: newUser._id },
        TOKEN_TYPE.EMAIL_VERIFICATION,
        86400
    )
    const verifyLink = `${LINK_VERIFY_EMAIL_URL}/${verificationToken}`

    EmailService.sendVerificationEmail(newUser, verifyLink).catch(err => {
        console.error('Failed to send verification email:', err)
    })

    res.status(201).jsonify({ email: newUser.email }, 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.')
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await registrationAuthService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function me(req, res) {
    const profileData = await registrationAuthService.profile(req.currentRegistration._id)
    const { avatar_url, ...result } = profileData
    res.jsonify({
        ...result,
        avatar: buildStaticUrl(avatar_url)
    })
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

export async function forgotPassword(req, res) {
    const token = generateToken(
        { user_id: req.currentRegistration._id },
        TOKEN_TYPE.FORGOT_PASSWORD,
        600
    )

    const resetLink = `${LINK_RESET_PASSWORD_URL}?token=${encodeURIComponent(token)}`

    await EmailService.sendPasswordResetEmail(req.currentRegistration, resetLink)

    res.status(200).jsonify('Yêu cầu lấy lại mật khẩu thành công! Vui lòng kiểm tra email của bạn.')
}

export async function resetPassword(req, res) {
    await registrationAuthService.resetPassword(req.currentRegistration._id, req.body.new_password)
    await registrationAuthService.blockToken(req.params.token)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

export async function verifyEmail(req, res) {
    try {
        await registrationAuthService.activateAccount(req.currentRegistration._id)
    } catch (error) {
        console.log(error)
    }
    try {
        await registrationAuthService.blockToken(req.verificationToken)
    } catch (error) {
        console.log(error)
    }

    EmailService.sendWelcomeEmail(req.currentRegistration).catch(err => {
        console.error('Failed to send welcome email:', err)
    })

    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác thực thành công</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background: linear-gradient(135deg, #ffffffff 0%, #494949ff 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .container {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    padding: 48px;
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .success-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #c3c3c4ff 0%, #494949ff 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    animation: scaleIn 0.5s ease-out;
                }
                .success-icon svg {
                    width: 48px;
                    height: 48px;
                    stroke: white;
                    stroke-width: 3;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    fill: none;
                }
                h1 {
                    color: #1a202c;
                    font-size: 28px;
                    margin-bottom: 16px;
                    font-weight: 700;
                }
                p {
                    color: #4a5568;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">
                    <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h1>Xác thực thành công!</h1>
                <p>Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.</p>
            </div>
        </body>
        </html>
    `)
}
