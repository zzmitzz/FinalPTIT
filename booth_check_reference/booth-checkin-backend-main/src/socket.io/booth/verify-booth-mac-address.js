import {STATUS_DEFAULT_MESSAGE, VALIDATE_MAC_ADDRESS_REGEX} from '@/configs'
import {Booth} from '@/models'

async function verifyBoothMacAddress(socket, next) {
    try {
        const macAddress = socket.handshake.auth.mac_address
        if (macAddress && VALIDATE_MAC_ADDRESS_REGEX.test(macAddress)) {
            const booth = await Booth.findOne({mac: macAddress})

            if (booth) {
                socket.booth = booth
                next()
                return
            }
        }
        next({message: 'Địa chỉ MAC không hợp lệ.'})
    } catch (error) {
        next({message: STATUS_DEFAULT_MESSAGE[500]})
    }
}

export default verifyBoothMacAddress
