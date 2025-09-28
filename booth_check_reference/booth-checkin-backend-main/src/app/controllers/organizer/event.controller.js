import * as eventService from '@/app/services/event.service'
import * as formService from '@/app/services/form.service'
import { generateQRCheckInImage } from '@/app/services/qr.service'
import * as lwPrizeService from '@/app/services/lucky-wheel-service/lucky-wheel-prize.service'
import * as registrationService from '@/app/services/registration.service'
import * as xlsxService from '@/app/services/xlsx.service'
import * as prizeService from '@/app/services/prize.service'
import * as miniGameSettingService from '@/app/services/mini-game-setting.service'
import { LINK_STATIC_URL, SOCKET_EVENT, db } from '@/configs'
import { RegistrationResponse } from '@/models'
import io from '@/socket.io'
import { sendMail } from '@/utils/helpers'
import _ from 'lodash'
import removeAccents from 'remove-accents'
import * as lwService from '@/app/services/lucky-wheel-service/lucky-wheel.service'

export async function readRoot(req, res) {
    const result = await eventService.readEventsOfOrganizer(req.currentOrganizer, req.query)
    return res.jsonify(result)
}

export async function createItem(req, res) {
    await db.transaction(async function (session) {
        const requestBody = req.body
        if (!_.isNumber(requestBody.booth_check_in)) delete requestBody.booth_check_in
        if (_.isEmpty(requestBody.mini_game)) delete requestBody.mini_game

        await eventService.createEvent(session, req.currentOrganizer, requestBody)
        res.status(201).jsonify()
    })
}

export async function updateItem(req, res) {
    await db.transaction(async function (session) {
        const requestBody = req.body
        if (_.isEmpty(requestBody.thumbnail)) delete requestBody.thumbnail
        if (!_.isNumber(requestBody.booth_check_in)) delete requestBody.booth_check_in
        if (!_.isArray(requestBody.mini_game)) requestBody.mini_game = []

        await eventService.updateEvent(session, req.event, requestBody)
        const boothIds = await eventService.getBoothIdsAssignedToEvent(req.event)
        for (const boothId of boothIds) {
            io.of('/booth')
                .in(`booth-${boothId}`)
                .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, null)
        }
        res.status(201).jsonify()
    })
}

export async function deleteItem(req, res) {
    await db.transaction(async function (session) {
        await eventService.deleteEvent(session, req.event)
        const boothIds = await eventService.getBoothIdsAssignedToEvent(req.event)
        for (const boothId of boothIds) {
            io.of('/booth')
                .in(`booth-${boothId}`)
                .emit(SOCKET_EVENT.BOOTH.EVENT_TRACING, null)
        }
        res.jsonify()
    })
}

export async function readItem(req, res) {
    const result = await eventService.readEvent(req.event)
    res.jsonify(result)
}

export async function saveFormForEvent(req, res) {
    await db.transaction(async function (session) {
        await formService.saveForm(session, req.event, req.body)
        res.status(201).jsonify()
    })
}

export async function exportTemplateExcelFile(req, res) {
    const data = await xlsxService.exportTemplateXlsxFromFields(req.formFields)
    res.attachment(removeAccents(`Đăng ký tham gia ${req.event.name}.xlsx`)).send(data)
}

export async function uploadRegistrationExcelData(req, res) {
    await db.transaction(async function (session) {
        const result = await registrationService.insertMultiRegistration(
            session,
            req.event,
            req.registrations,
            req.registrationResponses
        )
        await Promise.all(
            req.emails.map(async function ({ registrationId, emailAddress }) {
                const regResponse = await RegistrationResponse.find({
                    registration_id: registrationId,
                    position: { $lte: 1 },
                })
                    .sort({ position: 1 })
                    .select({
                        event_id: 0,
                        form_id: 0,
                        registration_id: 0,
                        created_at: 0,
                        updated_at: 0,
                    })
                    .session(session)
                    .lean()
                const qrCheckinImage = await generateQRCheckInImage('base64', {
                    registrationId: registrationId,
                    registrationName: regResponse[0].response,
                    registrationPhone: regResponse[1].response,
                })
                sendMail({
                    to: emailAddress,
                    subject: 'Đăng ký thành công ' + req.event.name,
                    template: 'emails/send-qr-checkin.html',
                    data: {
                        linkLogo: LINK_STATIC_URL + 'logo-event-recovered.png',
                        name: regResponse[0].response,
                        eventName: req.event.name,
                    },
                    attachments: [
                        {
                            filename: 'qr_checkin.png',
                            content: qrCheckinImage.split(';base64,')[1],
                            encoding: 'base64',
                            cid: 'qr_checkin',
                        },
                    ],
                })
            })
        )
        io.of(`/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPLOAD, result)
        io.of(`/admin/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPLOAD, result)
        io.of(`/booth/event/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPLOAD, result)
        res.status(201).jsonify()
    })
}

export async function publicEventForm(req, res) {
    await db.transaction(async function (session) {
        req.form.is_public = !req.form.is_public
        await req.form.save({ session })
        res.status(201).jsonify()
    })
}

export async function readRegistrations(req, res) {
    const result = await registrationService.readRegistrationsOfEvent(req.event, req.query)
    res.jsonify(result)
}

export async function readPrizesOfEvent(req, res) {
    const [setting, prizes] = await Promise.all([
        miniGameSettingService.getMiniGameSetting(req.event, req.params.MINI_GAME_CODE),
        prizeService.readPrizesOfEvent(req.event, req.params.MINI_GAME_CODE),
    ])
    res.jsonify({ setting, prizes })
}

export async function updateMiniGameSetting(req, res) {
    await db.transaction(async function (session) {
        await miniGameSettingService.updateMiniGameSettingOfEvent(session, req.event, req.body)
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

export async function sortPrize(req, res) {
    await db.transaction(async function (session) {
        await prizeService.sort(session, req.body)
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

export async function updateRegistrationResponse(req, res) {
    await db.transaction(async function (session) {
        const { registrationId } = req.params
        const { responses } = req.body

        // Find all registration responses for this registration
        const existingResponses = await RegistrationResponse.find({
            registration_id: registrationId,
            event_id: req.event._id
        }).session(session)

        // Update each response with new data
        for (const response of responses) {
            const existingResponse = existingResponses.find(r =>
                (response._id && r._id.toString() === response._id) ||
                r.position === response.position
            )

            if (existingResponse) {
                // Update existing response
                existingResponse.response = response.response
                await existingResponse.save({ session })
            }
        }

        // Emit socket event for real-time updates
        io.of(`/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPDATE, { registrationId })
        io.of(`/admin/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPDATE, { registrationId })
        io.of(`/booth/event/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPDATE, { registrationId })

        res.status(200).jsonify({ success: true })
    })
}

export async function updateRegistrationVIP(req, res) {
    await db.transaction(async function (session) {
        const { is_vip } = req.body

        // Update the registration's VIP status
        req.registration.is_vip = is_vip
        await req.registration.save({ session })

        // Emit socket event for real-time updates
        io.of(`/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPDATE, { registrationId: req.registration._id })
        io.of(`/admin/events/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPDATE, { registrationId: req.registration._id })
        io.of(`/booth/event/${req.event._id}`).emit(SOCKET_EVENT.REGISTRANT.UPDATE, { registrationId: req.registration._id })

        res.status(200).jsonify({ success: true, is_vip })
    })
}


/*
 - Database transaction
*/

export async function lwCreatePrize(req, res) {
    await db.transaction(async function (session) {
        await lwPrizeService.create(session, req.body)
        res.status(201).jsonify()
    })
}

export async function lwUpdatePrize(req, res) {
    await db.transaction(async function (session) {
        await lwPrizeService.update(session, req.lwPrize, req.body)
        res.status(201).jsonify()
    })
}
export async function lwDeletePrize(req, res) {
    await db.transaction(async function (session) {
        await lwPrizeService.remove(session, req.lwPrize)
        res.jsonify()
    })
}


export async function lwReadPrizesOfEvent(req, res) {
    await db.transaction(async function (session) {
        const prizes = await lwPrizeService.getPrizeOfEvent(req.event, session)
        res.jsonify(prizes)
    })
}

/**
 * Lucky Wheel Controller Functions
 */
export async function getLuckyWheels(req, res) {
    const result = await lwService.getLuckyWheels(req.event)
    res.jsonify(result)
}

export async function createLuckyWheel(req, res) {
    await db.transaction(async function (session) {
        const result = await lwService.createLuckyWheel(session, req.event, req.currentOrganizer, req.body)
        res.status(201).jsonify(result)
    })
}

export async function getLuckyWheel(req, res) {
    const { luckyWheelId } = req.params
    const result = await lwService.getLuckyWheel(req.event, luckyWheelId)
    if (!result) {
        return res.status(404).jsonify({ message: 'Lucky wheel not found' })
    }
    res.jsonify(result)
}

export async function updateLuckyWheel(req, res) {
    const { luckyWheelId } = req.params
    await db.transaction(async function (session) {
        const result = await lwService.updateLuckyWheel(session, req.event, luckyWheelId, req.body)
        if (!result) {
            return res.status(404).jsonify({ message: 'Lucky wheel not found' })
        }
        res.jsonify(result)
    })
}

export async function deleteLuckyWheel(req, res) {
    const { luckyWheelId } = req.params
    await db.transaction(async function (session) {
        const result = await lwService.deleteLuckyWheel(session, req.event, luckyWheelId)
        if (!result) {
            return res.status(404).jsonify({ message: 'Lucky wheel not found' })
        }
        res.jsonify({ message: 'Lucky wheel deleted successfully' })
    })
}

export async function setLuckyWheelPrizes(req, res) {
    const { luckyWheelId } = req.params
    await db.transaction(async function (session) {
        const result = await lwService.setLuckyWheelPrizes(session, req.event, luckyWheelId, req.body.prizes)
        if (!result) {
            return res.status(404).jsonify({ message: 'Lucky wheel not found' })
        }
        res.jsonify(result)
    })
}

export async function getLuckyWheelPrizes(req, res) {
    const { luckyWheelId } = req.params
    const result = await lwService.getLuckyWheelPrizes(req.event, luckyWheelId)
    if (!result) {
        return res.status(404).jsonify({ message: 'Lucky wheel not found' })
    }
    res.jsonify(result)
}

export async function spinLuckyWheel(req, res) {
    const { luckyWheelId } = req.params
    await db.transaction(async function (session) {
        const result = await lwService.spinLuckyWheel(session, req.event, luckyWheelId, req.body.registration_id)
        if (!result) {
            // Return a 200 success response with data indicating no prize was available
            // Instead of a 404 error which causes issues with the response handler
            return res.jsonify({
                success: false,
                message: 'No available prizes or lucky wheel not found',
                prize: null,
                registration: null,
                remaining_quantities: {}
            })
        }
        res.jsonify(result)
    })
}

export async function getLuckyWheelHistory(req, res) {
    const { luckyWheelId } = req.params
    const result = await lwService.getLuckyWheelHistory(req.event, luckyWheelId, req.query)
    if (!result) {
        return res.status(404).jsonify({ message: 'Lucky wheel not found' })
    }
    res.jsonify(result)
}

export async function getEventStatistics(req, res) {
    const statistics = await eventService.getEventStatistics(req.event)
    res.jsonify(statistics)
}