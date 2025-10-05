import moment from 'moment'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as registrationRepo from '@/db/registration_repository'
import {cache, LOGIN_EXPIRE_IN, TOKEN_TYPE} from '@/configs'
import {generateToken} from '@/utils/helpers'

export const registrationTokenBlocklist = cache.create('registration-token-block-list')

export async function checkValidLogin({email, password}) {
    const registration = await registrationRepo.findRegistrationByEmail(email)
    if (registration) {
        const verified = await bcrypt.compare(password, registration.password)
        if (verified) return registration
    }
    return false
}

export function authToken(registration) {
    const accessToken = generateToken(
        {user_id: registration._id},
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

export async function register({email, phone = '', password}) {
    const passwordHash = await bcrypt.hash(password, 10)
    return await registrationRepo.createRegistration({email, phone, password: passwordHash})
}

export async function profile(userId) {
    return await registrationRepo.findRegistrationById(userId)
}

export async function updateProfile(currentRegistration, updateData) {
    const allowedFields = ['full_name', 'phone', 'dob', 'gender', 'address', 'bio']
    const filteredData = {}
    
    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            filteredData[field] = updateData[field]
        }
    }
    
    await registrationRepo.updateRegistrationById(currentRegistration._id, filteredData)
}

export async function resetPassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await registrationRepo.updateRegistrationById(userId, {password: passwordHash})
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await registrationTokenBlocklist.set(token, 1, expiresIn - now)
}

