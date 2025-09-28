import {SOCKET_EVENT, db} from '@/configs'
import {Booth} from '@/models'
import _ from 'lodash'
import moment from 'moment'

export const path = '/booth'

const activeBoothOnConnected = function (boothId) {
    db.transaction(async function (session) {
        const booth = await Booth.findById(boothId).session(session)
        booth.last_time = moment().toDate()
        await booth.save({session})
    })
        .then(_.noop)
        .catch(_.noop)
}

const deActiveBoothOnDisconnected = function (boothId) {
    const lastTime = moment().subtract(1.1, 'minute').toDate()
    db.transaction(async function (session) {
        const booth = await Booth.findById(boothId).session(session)
        booth.last_time = lastTime
        await booth.save({session})
    })
        .then(_.noop)
        .catch(_.noop)
    return lastTime.toISOString()
}

export const onConnected = function (socket) {
    const boothId = socket.booth._id
    socket.join(`booth-${boothId}`)
    activeBoothOnConnected(boothId)
    socket.server.of('/admin/booths').emit(SOCKET_EVENT.BOOTH.ACTIVE, `${boothId}`)
    socket.server.of('/booths').emit(SOCKET_EVENT.BOOTH.ACTIVE, `${boothId}`)
    socket.on('disconnect', function () {
        const lastTime = deActiveBoothOnDisconnected(boothId)
        socket.server.of('/admin/booths').emit(SOCKET_EVENT.BOOTH.INACTIVE, `${boothId}`, lastTime)
        socket.server.of('/booths').emit(SOCKET_EVENT.BOOTH.INACTIVE, `${boothId}`, lastTime)
    })
}
