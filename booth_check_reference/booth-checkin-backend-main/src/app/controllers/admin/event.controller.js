import * as eventService from '@/app/services/event.service'
import * as boothService from '@/app/services/booth.service'
import * as registrationService from '@/app/services/registration.service'
import * as prizeService from '@/app/services/prize.service'
import * as miniGameSettingService from '@/app/services/mini-game-setting.service'
import {SOCKET_EVENT, db} from '@/configs'
import io from '@/socket.io'

export async function getListEvent(req, res) {
    res.status(201).jsonify(await eventService.getList(req.query))
}

export async function getDetailEvent(req, res) {
    res.status(201).jsonify(await eventService.readEvent(req.event, false))
}

export async function getRegistrationsOfEvent(req, res) {
    res.status(201).jsonify(await registrationService.readRegistrationsOfEvent(req.event, req.query))
}

export async function approvalEvent(req, res) {
    await db.transaction(async function (session) {
        await eventService.approvalEvent(session, req.currentAdmin, req.event)
        const boothIds = await eventService.getBoothIdsAssignedToEvent(req.event)
        const setting = {
            check_in_type: req.event.check_in_type,
            use_print_card: req.event.use_print_card,
            allow_check_in: true
        }
        await boothService.updateSettingMultiBooth(session, boothIds, setting)
        const event = await eventService.readEventForBooth(req.event, session)
        for (const boothId of boothIds) {
            io.of('/booth')
                .in(`booth-${boothId}`)
                .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, event)
            io.of('/booth')
                .in(`booth-${boothId}`)
                .emit(SOCKET_EVENT.BOOTH.BOOTH_SETTING, setting)
        }
        res.status(201).jsonify('Duyệt sự kiện thành công.')
    })
}

export async function cancelEvent(req, res) {
    await db.transaction(async function (session) {
        await eventService.cancelEvent(session, req.currentAdmin, req.event)
        const boothIds = await eventService.getBoothIdsAssignedToEvent(req.event)
        for (const boothId of boothIds) {
            io.of('/booth')
                .in(`booth-${boothId}`)
                .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, null)
        }
        res.status(201).jsonify('Hủy sự kiện thành công.')
    })
}

export async function lockEvent(req, res) {
    await db.transaction(async function (session) {
        await eventService.lockEvent(session, req.event, req.params.action)
        const boothIds = await eventService.getBoothIdsAssignedToEvent(req.event)
        if (req.params.action === 'LOCKED') {
            for (const boothId of boothIds) {
                io.of('/booth')
                    .in(`booth-${boothId}`)
                    .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, null)
            }
        } else {
            const event = await eventService.readEventForBooth(req.event, session)
            for (const boothId of boothIds) {
                io.of('/booth')
                    .in(`booth-${boothId}`)
                    .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, event)
            }
        }

        res.status(201).jsonify(`${req.actionLock === 'LOCKED' ? 'Khóa' : 'Mở khóa'} sự kiện thành công.`)
    })
}

export async function assignBoothToEvent(req, res) {
    await db.transaction(async function (session) {
        const [newBooths, deletedBooths] = await boothService.assignBoothToEvent(session, req.event, req.body.booth_ids)
        const setting = {
            check_in_type: req.event.check_in_type,
            use_print_card: req.event.use_print_card,
            allow_check_in: true
        }
        await boothService.updateSettingMultiBooth(session, newBooths, setting)
        const event = await eventService.readEventForBooth(req.event, session)
        const boothNsp = io.of('/booth')
        for (const boothId of newBooths) {
            boothNsp
                .in(`booth-${boothId}`)
                .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, event)
            boothNsp
                .in(`booth-${boothId}`)
                .emit(SOCKET_EVENT.BOOTH.BOOTH_SETTING, setting)
        }
        for (const boothId of deletedBooths) {
            boothNsp.in(`booth-${boothId}`).emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, null)
        }

        res.status(201).jsonify()
    })
}

export async function readPrizesOfEvent(req, res) {
    const [setting, prizes] = await Promise.all([
        miniGameSettingService.getMiniGameSetting(req.event, req.params.MINI_GAME_CODE),
        prizeService.readPrizesOfEvent(req.event, req.params.MINI_GAME_CODE),
    ])
    res.jsonify({setting, prizes})
}
