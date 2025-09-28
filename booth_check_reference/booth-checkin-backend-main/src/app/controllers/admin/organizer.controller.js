import * as organizerService from '@/app/services/organizer.service'
import * as eventService from '@/app/services/event.service'
import {db} from '@/configs'

export async function createItem(req, res) {
    await db.transaction(async function (session) {
        await organizerService.create(session, req.body)
        res.status(201).jsonify()
    })
}

export async function updateItem(req, res) {
    await db.transaction(async function (session) {
        await organizerService.update(session, req.organizer, req.body)
        res.status(201).jsonify()
    })
}

export async function changePassword(req, res) {
    await db.transaction(async function (session) {
        await organizerService.changePassword(session, req.organizer, req.body)
        res.status(201).jsonify()
    })
}

export async function deleteItem(req, res) {
    await db.transaction(async function (session) {
        await organizerService.deleteItem(session, req.organizer)
        res.status(201).jsonify()
    })
}

export async function readRoot(req, res) {
    const result = await organizerService.getList(req.query)
    res.jsonify(result)
}

export async function details(req, res) {
    const result = await organizerService.getStatistical(req.organizer)
    res.jsonify({
        organizer: req.organizer,
        statistical: result,
    })
}

export async function getListEventByOrganizerId(req, res) {
    const result = await eventService.readEventsOfOrganizer(req.organizer, req.query)
    res.jsonify(result)
}
