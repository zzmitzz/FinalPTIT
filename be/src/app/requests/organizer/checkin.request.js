import Joi from 'joi'
import { AsyncValidate } from '@/utils/classes'
import * as eventRepo from '@/db/event_repository'
import * as registrationRepo from '@/db/registration_repository'
import * as registrationRegisterEventRepo from '@/db/registration_register_event_repository'

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
                    // Verify registration exists
                    const registration = await registrationRepo.findRegistrationById(value)
                    if (!registration) {
                        return helpers.message('{{#label}} không tồn tại.')
                    }
                    
                    // Verify registration is registered for this event
                    const { event_id } = helpers.prefs.context.data
                    const registrationRegisterEvent = await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
                        event_id,
                        value
                    )
                    
                    if (!registrationRegisterEvent) {
                        return helpers.message('Người dùng chưa đăng ký tham gia sự kiện này.')
                    }
                    
                    if (!registrationRegisterEvent.is_registered) {
                        return helpers.message('Người dùng chưa đăng ký tham gia sự kiện này.')
                    }
                    
                    req.registration = registration
                    req.registrationRegisterEvent = registrationRegisterEvent
                    return value
                })
        )
})

