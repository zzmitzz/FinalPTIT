import {SOCKET_EVENT, db} from '@/configs'
import * as registrationService from '@/app/services/registration.service'
import * as eventService from '@/app/services/event.service'
import * as boothService from '@/app/services/booth.service'
import * as prizeService from '@/app/services/prize.service'
import io from '@/socket.io'
import {EVENT_STATUS} from '@/models'
import { abort } from '@/utils/helpers'

export async function readEventAssigned(req, res) {
    if (req.booth.event_id) {
        const event = await eventService.readEventForBooth(req.booth.event)
        if (event.is_locked || event.status !== EVENT_STATUS.APPROVED) {
            res.jsonify(null)
        } else {
            event.setting = req.booth.setting
            res.jsonify(event)
        }
    } else {
        res.jsonify(null)
    }

}

export async function readEvent(req, res) {
    const result = await eventService.readEventForBooth(req.event)
    result.setting = req.booth.setting
    res.jsonify(result)
}

export async function confirmAttendance(req, res) {
    await db.transaction(async function (session) {
        const result = await registrationService.checkIn(session, req.booth, req.member, req.body)
        io.of(`/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.CHECK_IN, result)
        io.of(`/admin/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.CHECK_IN, result)
        io.of(`/booth/event/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.CHECK_IN, result)
        res.status(201).jsonify(result.member)
    })
}

export async function confirmAttendances(req, res){
    await db.transaction(async function (session) {
        const result = await registrationService.multipleCheckIn(session, req.booth, req.proccessedResults, req.event, req.body)
        io.of(`/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.CHECK_IN, result)
        io.of(`/admin/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.CHECK_IN, result)
        io.of(`/booth/event/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.CHECK_IN, result)
        res.status(201).jsonify(result.members)
    })
    
}

export async function getListRegistration(req, res) {
    const result = await registrationService.readRegistrationsCheckInOfEvent(req.event, req.booth)
    res.jsonify(result)
}

export async function pingBooth(req, res) {
    await db.transaction(async function (session) {
        await boothService.pingBooth(session, req.booth)
        io.of('/admin/booths').emit(SOCKET_EVENT.BOOTH.PING, req.booth._id)
        io.of('/booths').emit(SOCKET_EVENT.BOOTH.PING, req.booth._id)
        res.status(201).jsonify()
    })
}

export async function grantPrize(req, res){
    await db.transaction(async function (session) {
        const gift = await prizeService.distributePrize(
            session,
            req.params.MINI_GAME_CODE,
            req.registration,
            {booth_mac: req.booth.mac}
        )
        if (!gift) {
            abort(410, 'Đã hết hoặc không có phần quà nào để nhận.')
        }
        res.status(201).jsonify(gift)
    })
}
