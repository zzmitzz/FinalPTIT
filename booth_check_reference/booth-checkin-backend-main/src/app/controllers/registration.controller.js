import QRCode from 'qrcode'
import {CRYPTO_TYPE} from '@/configs'
import {encrypt} from '@/utils/helpers'

export async function generateQrRegistrations(req, res) {
    const qrImage = await QRCode.toBuffer(encrypt(req.params.registrationId, CRYPTO_TYPE.QR_CODE))
    res.type('png').send(qrImage)
}
