import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import * as registrationRepo from '@/db/registration_repository'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {LOGIN_EXPIRE_IN, TOKEN_TYPE} from '@/configs'
import {generateToken} from '@/utils/helpers'

const authRouter = Router()

function authToken(user) {
    const accessToken = generateToken({user_id: user._id}, TOKEN_TYPE.AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {access_token: accessToken, expire_in: expireIn, auth_type: 'Bearer Token'}
}

// Minimal validators inline to keep scope small
const loginSchema = {
    body: {
        email: (v) => typeof v === 'string' && v.includes('@'),
        password: (v) => typeof v === 'string' && v.length > 0,
    },
}

/**
 * @swagger
 * /registrations/auth/login:
 *   post:
 *     summary: Registration user login
 *     description: Authenticate registration user with email and password
 *     tags: [Registration Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registration user email address
 *               password:
 *                 type: string
 *                 description: Registration user password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post(
    '/login',
    asyncHandler(async function (req, res) {
        const {email, password} = req.body
        const reg = await registrationRepo.findRegistrationByEmail(email)
        if (!reg) return res.status(400).jsonify('Email hoặc mật khẩu không đúng.')
        const ok = await bcrypt.compare(password, reg.password)
        if (!ok) return res.status(400).jsonify('Email hoặc mật khẩu không đúng.')
        res.jsonify(authToken(reg))
    })
)

/**
 * @swagger
 * /registrations/auth/register:
 *   post:
 *     summary: Registration user registration
 *     description: Register a new registration user
 *     tags: [Registration Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registration user email address
 *               password:
 *                 type: string
 *                 description: Registration user password
 *               phone:
 *                 type: string
 *                 description: Registration user phone number
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthToken'
 *                 - $ref: '#/components/schemas/Success'
 *       400:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post(
    '/register',
    asyncHandler(async function (req, res) {
        const {email, phone = '', password} = req.body
        const pass = await bcrypt.hash(password, 10)
        const reg = await registrationRepo.createRegistration({email, phone, password: pass})
        res.status(201).jsonify(authToken(reg), 'Đăng ký thành công.')
    })
)

export default authRouter
