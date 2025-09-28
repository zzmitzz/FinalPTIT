import {SOCKET_EVENT, db} from '@/configs'
import * as boothService from '@/app/services/booth.service'
import * as eventService from '@/app/services/event.service'
import io from '@/socket.io'

export async function getListBooth(req, res) {
    const data = await boothService.getList()

    res.status(201).jsonify(data)
}

export async function createBooth(req, res) {
    await db.transaction(async function (session) {
        await boothService.create(session, req.body)

        res.status(201).jsonify('Tạo mới Booth Check In thành công.')
    })
}

export async function updateBooth(req, res) {
    await db.transaction(async function (session) {
        await boothService.update(session, req.booth, req.body)

        res.status(201).jsonify('Cập nhật Booth Check In thành công.')
    })
}

export async function removeBooth(req, res) {
    await db.transaction(async function (session) {
        await boothService.remove(session, req.booth._id)

        res.status(201).jsonify('Xóa Booth Check In thành công.')
    })
}

export async function assignToEvent(req, res) {
    await db.transaction(async function (session) {
        req.booth.event_id = req.body.event_id || null
        if (req.event) {
            req.booth.setting.check_in_type = req.event.check_in_type
            req.booth.setting.use_print_card = req.event.use_print_card
            req.booth.setting.allow_check_in = true
        }
        await req.booth.save({session})
        let event = null
        if (req.event) {
            event = await eventService.readEventForBooth(req.event, session)
        }
        io.of('/booth')
            .in(`booth-${req.booth._id}`)
            .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, event)
        io.of('/booth')
            .in(`booth-${req.booth._id}`)
            .emit(SOCKET_EVENT.BOOTH.BOOTH_SETTING, req.booth.setting)
        res.status(201).jsonify()
    })
}

export async function getListEventCanAssign(req, res) {
    const result = await eventService.getEventsCanAssign()
    res.jsonify(result)
}
