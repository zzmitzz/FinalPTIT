import {CRYPTO_TYPE} from '@/configs'
import {encrypt} from '@/utils/helpers'
import QRCode from 'qrcode'
import {createCanvas, loadImage} from 'canvas'
import assert from 'assert'

export async function generateQRCheckInImage(type, {registrationId, registrationName, registrationPhone}) {
    assert(type === 'base64' || type === 'buffer', new TypeError('"type" must be in "base64" or "buffer".'))
    const canvas = createCanvas(400, 500)
    const ctx = canvas.getContext('2d')
    const qrCodeBuffer = await QRCode.toBuffer(encrypt(registrationId, CRYPTO_TYPE.QR_CODE))
    const qrImage = await loadImage(qrCodeBuffer)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(qrImage, 0, 0, 400, 400)
    ctx.font = '32px Times New Roman'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.fillText(registrationName, 200, 420)
    ctx.fillText(registrationPhone.slice(0, 2) + 'xxxxx' + registrationPhone.slice(7), 200, 455)
    const outputDataURL = type === 'base64' ? canvas.toDataURL() : canvas.toBuffer()
    return outputDataURL
}
