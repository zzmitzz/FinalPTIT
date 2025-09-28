import {SECRET_KEY} from '@/configs'
import assert from 'assert'
import crypto from 'crypto'
import _ from 'lodash'

const KEY_SIZE = 16
const IV_LENGTH = 8
const AUTH_TAG_LENGTH = 4
const KEY = Buffer.alloc(KEY_SIZE)
KEY.write(SECRET_KEY)

export function encrypt(data, type) {
    assert(_.isString(type) && !_.isEmpty(type), new TypeError('"type" is required and must be a string.'))
    assert(!_.isUndefined(data), new TypeError('"data" is required.'))
    const obj = {type, data}
    const text = JSON.stringify(obj)

    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-128-ccm', KEY, iv, {
        authTagLength: AUTH_TAG_LENGTH,
        plaintextLength: Buffer.byteLength(text),
    })

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}:${encrypted}:${authTag}`
}

export function decrypt(encryptText, validType) {
    assert(_.isString(encryptText) && !_.isEmpty(encryptText), new TypeError('"encryptText" is required and must be a string.'))
    assert(_.isString(validType) && !_.isEmpty(validType), new TypeError('"validType" is required and must be a string.'))
    try {
        const textParts = encryptText.split(':')
        const iv = Buffer.from(textParts.shift(), 'hex')
        const encryptedText = textParts.shift()
        const authTag = Buffer.from(textParts.shift(), 'hex')

        const decipher = crypto.createDecipheriv('aes-128-ccm', KEY, iv, {
            authTagLength: AUTH_TAG_LENGTH,
            plaintextLength: encryptedText.length / 2,
        })

        decipher.setAuthTag(authTag)

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        const {type, data} = JSON.parse(decrypted.toString())
        if (type === validType) {
            return data
        }
    } catch (error) {
        // PASS
    }
}
