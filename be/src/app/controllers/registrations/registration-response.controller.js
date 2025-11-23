import * as registrationResponseService from '@/app/services/registrations/registration-response.service'
import { registerUserForEvent } from '@/app/services/registrations/registration-register-event.service'

/**
 * Create a new registration response
 * POST /registrations/responses
 */
export async function createRegistrationResponse(req, res) {
    // Ensure the registration_id matches the authenticated user
    const responseData = {
        ...req.body,
        registration_id: req.currentRegistration._id
    }

    const response = await registrationResponseService.createRegistrationResponse(responseData)
    res.status(201).jsonify(response, 'Tạo câu trả lời đăng ký thành công.')
}

/**
 * Get registration response by ID
 * GET /registrations/responses/:id
 */
export async function getRegistrationResponseById(req, res) {
    const response = await registrationResponseService.getRegistrationResponseById(req.params.id)

    // Ensure the response belongs to the authenticated user
    if (response.registration_id !== req.currentRegistration._id) {
        return res.status(403).jsonify(null, 'Bạn không có quyền truy cập câu trả lời này.')
    }

    res.jsonify(response)
}

/**
 * Get list of registration responses for authenticated user
 * GET /registrations/responses
 */
export async function getMyRegistrationResponses(req, res) {
    const { page, limit, event_id, form_fields_id } = req.query

    const responses = await registrationResponseService.getRegistrationResponses({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        registration_id: req.currentRegistration._id,
        event_id,
        form_fields_id
    })

    const total = await registrationResponseService.countRegistrationResponses({
        registration_id: req.currentRegistration._id,
        event_id
    })

    const currentPage = parseInt(page) || 1
    const currentLimit = parseInt(limit) || 20

    res.jsonify({
        data: responses,
        pagination: {
            page: currentPage,
            limit: currentLimit,
            total,
            totalPages: Math.ceil(total / currentLimit)
        }
    })
}

/**
 * Update a registration response
 * PUT /registrations/responses/:id
 */
export async function updateRegistrationResponse(req, res) {
    // First check if the response belongs to the authenticated user
    const existingResponse = await registrationResponseService.getRegistrationResponseById(req.params.id)

    if (existingResponse.registration_id !== req.currentRegistration._id) {
        return res.status(403).jsonify(null, 'Bạn không có quyền cập nhật câu trả lời này.')
    }

    // Ensure registration_id cannot be changed
    const updateData = {
        ...req.body,
        registration_id: req.currentRegistration._id
    }

    const updatedResponse = await registrationResponseService.updateRegistrationResponse(
        req.params.id,
        updateData
    )
    res.jsonify(updatedResponse, 'Cập nhật câu trả lời đăng ký thành công.')
}

/**
 * Bulk create registration responses for authenticated user (form submission)
 * POST /registrations/responses/submit
 */
export async function submitFormResponses(req, res) {
    const { event_id, responses } = req.body

    if (!Array.isArray(responses) || responses.length === 0) {
        return res.status(400).jsonify(null, 'Danh sách câu trả lời không hợp lệ.')
    }

    // Ensure all responses belong to the authenticated user and same event
    const responsesData = responses.map(r => ({
        ...r,
        event_id,
        registration_id: req.currentRegistration._id
    }))

    const createdResponses = await registrationResponseService.bulkCreateRegistrationResponses(responsesData)

    // Record that the registration is registered after success fill the form
    await registerUserForEvent(event_id, req.currentRegistration._id)

    res.status(201).jsonify(createdResponses, 'Gửi biểu mẫu thành công.')
}

