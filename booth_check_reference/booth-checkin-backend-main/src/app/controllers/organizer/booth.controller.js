import {SOCKET_EVENT, db} from '@/configs'
import * as boothService from '@/app/services/booth.service'
import io from '@/socket.io'

export async function getListBooth(req, res) {
    const data = await boothService.getListBoothOrganizer(req.currentOrganizer)

    res.status(201).jsonify(data)
}

export async function updateBoothSetting(req, res) {
    await db.transaction(async function (session) {
        const result = await boothService.updateSettingBooth(session, req.booth, req.body)
        io.of('/booth').to(`booth-${req.booth._id}`).emit(SOCKET_EVENT.BOOTH.BOOTH_SETTING, result)
        res.status(201).jsonify()
    })
}
