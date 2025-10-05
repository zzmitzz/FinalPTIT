import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as organizerRepo from '@/db/organizer_repo'
import {cache, LOGIN_EXPIRE_IN, TOKEN_TYPE} from '@/configs'
import {generateToken} from '@/utils/helpers'

export const organizerTokenBlocklist = cache.create('organizer-token-block-list')

export async function checkValidLogin({email, password}) {
    const organizer = await organizerRepo.findOrganizerByEmail(email)
    if (organizer) {
        const verified = await bcrypt.compare(password, organizer.password)
        if (verified) return organizer
    }
    return false
}

export function authToken(organizer) {
    const accessToken = generateToken({user_id: organizer._id}, TOKEN_TYPE.AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

export async function register({name, email, phone = '', password}) {
    const passwordHash = await bcrypt.hash(password, 10)
    return await organizerRepo.createOrganizer({name, email, phone, password: passwordHash})
}

export async function profile(userId) {
    return await organizerRepo.findOrganizerById(userId)
}

export async function updateProfile(currentOrganizer, {name, email, phone}) {
    await organizerRepo.updateOrganizerById(currentOrganizer._id, {name, email, phone})
}

export async function resetPassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await organizerRepo.updateOrganizerById(userId, {password: passwordHash})
} 