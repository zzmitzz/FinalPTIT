import Joi from 'joi'
import { AsyncValidate } from '@/utils/classes'
import * as sessionRepo from '@/db/session_repository'
import * as sessionRegistrationRepo from '@/db/session_registration_repository'
import * as eventRepo from '@/db/event_repository'

/**
 * Validation for registering to a session
 */
export const registerForSession = Joi.object({
    session_id: Joi.number()
        .integer()
        .required()
        .label('Session ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    // Verify session exists
                    const session = await sessionRepo.findSessionById(value)
                    if (!session) {
                        return helpers.message('{{#label}} không tồn tại.')
                    }

                    // Verify session is active
                    if (!session.is_active) {
                        return helpers.message('Phiên này hiện không nhận đăng ký.')
                    }

                    // Verify session hasn't ended
                    const now = new Date()
                    const sessionEnd = new Date(session.end_time)
                    if (now > sessionEnd) {
                        return helpers.message('Phiên này đã kết thúc.')
                    }

                    return value
                })
        )
})

/**
 * Validation for checking in to a session
 */
export const checkInToSession = Joi.object({
    session_id: Joi.number()
        .integer()
        .required()
        .label('Session ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    // Verify session exists
                    const session = await sessionRepo.findSessionById(value)
                    if (!session) {
                        return helpers.message('{{#label}} không tồn tại.')
                    }

                    // Get user ID from authenticated user
                    const userId = req.currentRegistration?._id
                    if (!userId) {
                        return helpers.message('Không tìm thấy thông tin người dùng.')
                    }

                    // Verify user is registered for this session
                    const registration = await sessionRegistrationRepo.findSessionRegistrationByIds(value, userId)
                    if (!registration) {
                        return helpers.message('Bạn chưa đăng ký tham gia phiên này.')
                    }

                    // Verify registration status is 'attending'
                    if (registration.status !== 'attending') {
                        if (registration.status === 'checked_in') {
                            return helpers.message('Bạn đã check-in phiên này rồi.')
                        } else if (registration.status === 'cancelled') {
                            return helpers.message('Đăng ký của bạn đã bị hủy.')
                        } else if (registration.status === 'waitlist') {
                            return helpers.message('Bạn đang trong danh sách chờ.')
                        } else {
                            return helpers.message(`Trạng thái đăng ký không hợp lệ: ${registration.status}`)
                        }
                    }

                    // Validate check-in time is within session time range
                    const now = new Date()
                    const sessionStart = new Date(session.start_time)
                    const sessionEnd = new Date(session.end_time)

                    // Allow check-in 30 minutes before session starts
                    const checkInAllowedTime = new Date(sessionStart.getTime() - 30 * 60 * 1000)

                    if (now < checkInAllowedTime) {
                        return helpers.message('Chưa đến thời gian check-in. Bạn có thể check-in từ 30 phút trước khi phiên bắt đầu.')
                    }

                    if (now > sessionEnd) {
                        return helpers.message('Phiên này đã kết thúc, không thể check-in.')
                    }

                    return value
                })
        )
})

/**
 * Validation for cancelling a session registration
 */
export const cancelSessionRegistration = Joi.object({
    session_id: Joi.number()
        .integer()
        .required()
        .label('Session ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    // Verify session exists
                    const session = await sessionRepo.findSessionById(value)
                    if (!session) {
                        return helpers.message('{{#label}} không tồn tại.')
                    }

                    // Get user ID from authenticated user
                    const userId = req.currentRegistration?._id
                    if (!userId) {
                        return helpers.message('Không tìm thấy thông tin người dùng.')
                    }

                    // Verify user is registered for this session
                    const registration = await sessionRegistrationRepo.findSessionRegistrationByIds(value, userId)
                    if (!registration) {
                        return helpers.message('Bạn chưa đăng ký tham gia phiên này.')
                    }

                    // Verify registration can be cancelled
                    if (registration.status === 'cancelled') {
                        return helpers.message('Đăng ký này đã bị hủy trước đó.')
                    }

                    if (registration.status === 'checked_in') {
                        return helpers.message('Không thể hủy đăng ký đã check-in.')
                    }

                    return value
                })
        ),
    cancellation_reason: Joi.string()
        .trim()
        .max(500)
        .optional()
        .allow('')
        .label('Lý do hủy')
})

/**
 * Validation for getting user's session registrations
 */
export const getMySessionRegistrations = Joi.object({
    status: Joi.string()
        .trim()
        .valid('attending', 'waitlist', 'cancelled', 'checked_in', 'no_show')
        .optional()
        .label('Trạng thái'),
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .label('Trang'),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .label('Số lượng')
})

/**
 * Validation for getting sessions by event
 */
export const getSessionsByEvent = Joi.object({
    event_id: Joi.string()
        .trim()
        .required()
        .label('Event ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const event = await eventRepo.findEventById(value)
                    return event ? value : helpers.message('{{#label}} không tồn tại.')
                })
        )
})

