import {db, SOCKET_EVENT} from '@/configs'
import * as prizeService from '@/app/services/prize.service'
import * as eventService from '@/app/services/event.service'
import _ from 'lodash'
import io from '@/socket.io'

export async function createItem(req, res) {
    if (!_.isNumber(req.body.quantity) && _.isEmpty(req.body.quantity)) {
        req.body.quantity = null
    }
    await db.transaction(async function (session) {
        await prizeService.create(session, req.body)
        const [boothIds, event] = await Promise.all([
            eventService.getBoothIdsAssignedToEvent(req.event),
            eventService.readEventForBooth(req.event, session),
        ])
        for (const boothId of boothIds) {
            io.of('/booth').in(`booth-${boothId}`).emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, event)
        }
        res.status(201).jsonify()
    })
}

export async function updateItem(req, res) {
    if (_.isString(req.body.picture) && req.body.picture !== 'remove') {
        delete req.body.picture
    }
    if (!_.isNumber(req.body.quantity) && _.isEmpty(req.body.quantity)) {
        req.body.quantity = null
    }
    await db.transaction(async function (session) {
        await prizeService.update(session, req.prize, req.body)
        const [boothIds, event] = await Promise.all([
            eventService.getBoothIdsAssignedToEvent(req.prize.event),
            eventService.readEventForBooth(req.prize.event, session),
        ])
        for (const boothId of boothIds) {
            io.of('/booth').in(`booth-${boothId}`).emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, event)
        }
        res.status(201).jsonify()
    })
}

export async function deleteItem(req, res) {
    await db.transaction(async function (session) {
        await prizeService.remove(session, req.prize)
        const [boothIds, event] = await Promise.all([
            eventService.getBoothIdsAssignedToEvent(req.prize.event),
            eventService.readEventForBooth(req.prize.event, session),
        ])
        for (const boothId of boothIds) {
            io.of('/booth').in(`booth-${boothId}`).emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, event)
        }
        res.jsonify()
    })
}
