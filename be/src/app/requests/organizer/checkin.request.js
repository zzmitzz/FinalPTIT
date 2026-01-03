import Joi from 'joi'
import { AsyncValidate } from '@/utils/classes'
import * as eventRepo from '@/db/event_repository'
import * as registrationRepo from '@/db/registration_repository'
import * as registrationRegisterEventRepo from '@/db/registration_register_event_repository'

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function tryParseJson(value) {
    if (typeof value !== 'string') return null
    const s = value.trim()
    if (!s) return null
    if (!((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']')))) return null
    try {
        return JSON.parse(s)
    } catch {
        return null
    }
}

export const createCheckin = Joi.object({
    event_id: Joi.string()
        .trim()
        .required()
        .label('Event ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    // Verify event exists
                    const event = await eventRepo.findEventById(value)
                    if (!event) {
                        return helpers.message('{{#label}} không tồn tại.')
                    }
                    
                    // Verify event belongs to current organizer
                    if (event.organizer_id !== req.currentOrganizer._id) {
                        return helpers.message('Bạn không có quyền truy cập sự kiện này.')
                    }
                    
                    req.event = event
                    return value
                })
        ),
    registration_id: Joi.string()
        .trim()
        .required()
        .label('Registration ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const { event_id } = helpers.prefs.context.data

                    // Normalize registration_id:
                    // - accept UUID directly
                    // - accept numeric registration_register_event._id (string digits)
                    // - accept JSON string containing {registeredID} or {registration_id}
                    let normalizedRegistrationId = value
                    let derivedRegisterEvent = null

                    const parsed = tryParseJson(value)
                    if (parsed && typeof parsed === 'object') {
                        const candidate =
                            parsed.registration_id ??
                            parsed.registrationId ??
                            parsed._id ??
                            parsed.id

                        if (typeof candidate === 'string' && UUID_RE.test(candidate.trim())) {
                            normalizedRegistrationId = candidate.trim()
                        } else {
                            const rid = parsed.registeredID ?? parsed.registeredId
                            if (rid !== null && typeof rid !== 'undefined' && String(rid).trim() !== '') {
                                normalizedRegistrationId = String(rid).trim()
                            }
                        }
                    }

                    // If it's an integer id, map via registration_register_event
                    if (!UUID_RE.test(String(normalizedRegistrationId)) && /^\d{1,12}$/.test(String(normalizedRegistrationId))) {
                        const registerEventId = parseInt(String(normalizedRegistrationId), 10)
                        try {
                            const registerEvent = await registrationRegisterEventRepo.findRegistrationRegisterEventById(registerEventId)
                            if (!registerEvent) {
                                return helpers.message('{{#label}} không tồn tại.')
                            }

                            if (registerEvent.event_id !== event_id) {
                                return helpers.message('Người dùng chưa đăng ký tham gia sự kiện này.')
                            }

                            if (!registerEvent.is_registered) {
                                return helpers.message('Người dùng chưa đăng ký tham gia sự kiện này.')
                            }

                            derivedRegisterEvent = registerEvent
                            normalizedRegistrationId = registerEvent.registration_id
                        } catch (err) {
                            return helpers.message('{{#label}} không hợp lệ.')
                        }
                    }

                    // Verify registration exists (avoid 500 on invalid uuid input)
                    let registration = null
                    try {
                        registration = await registrationRepo.findRegistrationById(String(normalizedRegistrationId))
                    } catch (err) {
                        return helpers.message('{{#label}} không hợp lệ.')
                    }

                    if (!registration) {
                        return helpers.message('{{#label}} không tồn tại.')
                    }
                    
                    // Verify registration is registered for this event
                    const registrationRegisterEvent = derivedRegisterEvent
                        ? derivedRegisterEvent
                        : await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
                            event_id,
                            String(normalizedRegistrationId)
                        )
                    
                    if (!registrationRegisterEvent) {
                        return helpers.message('Người dùng chưa đăng ký tham gia sự kiện này.')
                    }
                    
                    if (!registrationRegisterEvent.is_registered) {
                        return helpers.message('Người dùng chưa đăng ký tham gia sự kiện này.')
                    }
                    
                    req.registration = registration
                    req.registrationRegisterEvent = registrationRegisterEvent
                        return String(normalizedRegistrationId)
                })
        )
})

