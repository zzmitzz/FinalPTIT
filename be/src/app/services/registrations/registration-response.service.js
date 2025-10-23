import * as registrationResponseRepo from '@/db/registration_responses_repository'
import * as formFieldRepo from '@/db/form_fields'
import { validateResponseByFieldType } from '@/utils/helpers/response-validator.helper'
import { abort } from '@/utils/helpers'

/**
 * Create a new registration response with validation
 */
export async function createRegistrationResponse(data) {
    const { form_fields_id, response } = data

    // Get the form field to validate the response
    const formField = await formFieldRepo.findFormFieldById(form_fields_id)
    if (!formField) {
        abort(404, 'Không tìm thấy trường form.')
    }

    // Validate the response against the field type
    const validation = validateResponseByFieldType(response, formField)
    if (!validation.valid) {
        abort(400, validation.error)
    }

    // Check if response already exists for this combination
    const existing = await registrationResponseRepo.findRegistrationResponseByCompositeKey(
        data.registration_id,
        data.form_fields_id,
        data.event_id
    )

    if (existing) {
        abort(409, 'Câu trả lời cho trường này đã tồn tại. Vui lòng sử dụng API cập nhật.')
    }

    // Create the response with validated value
    const responseData = {
        ...data,
        response: validation.value
    }

    return await registrationResponseRepo.createRegistrationResponse(responseData)
}

/**
 * Get registration response by ID
 */
export async function getRegistrationResponseById(id) {
    const response = await registrationResponseRepo.findRegistrationResponseById(id)
    if (!response) {
        abort(404, 'Không tìm thấy câu trả lời đăng ký.')
    }
    return response
}

/**
 * Get registration responses with filters
 */
export async function getRegistrationResponses(filters) {
    const { page = 1, limit = 20, event_id, registration_id, form_fields_id } = filters

    let responses

    if (registration_id) {
        responses = await registrationResponseRepo.findRegistrationResponsesByRegistrationId(registration_id)
    } else if (event_id) {
        responses = await registrationResponseRepo.findRegistrationResponsesByEventId(event_id)
    } else if (form_fields_id) {
        responses = await registrationResponseRepo.findRegistrationResponsesByFormFieldId(form_fields_id)
    } else {
        responses = await registrationResponseRepo.findAllRegistrationResponses(page, limit)
    }

    return responses
}

/**
 * Count registration responses with filters
 */
export async function countRegistrationResponses(filters) {
    const { event_id, registration_id } = filters

    if (registration_id) {
        return await registrationResponseRepo.countRegistrationResponsesByRegistrationId(registration_id)
    } else if (event_id) {
        return await registrationResponseRepo.countRegistrationResponsesByEventId(event_id)
    } else {
        return await registrationResponseRepo.countRegistrationResponses()
    }
}

/**
 * Update a registration response with validation
 */
export async function updateRegistrationResponse(id, updateData) {
    // Check if response exists
    const existingResponse = await registrationResponseRepo.findRegistrationResponseById(id)
    if (!existingResponse) {
        abort(404, 'Không tìm thấy câu trả lời đăng ký.')
    }

    // If updating the response value, validate it
    if ('response' in updateData) {
        // Determine which form field to validate against
        const formFieldId = updateData.form_fields_id || existingResponse.form_fields_id

        const formField = await formFieldRepo.findFormFieldById(formFieldId)
        if (!formField) {
            abort(404, 'Không tìm thấy trường form.')
        }

        // Validate the new response value
        const validation = validateResponseByFieldType(updateData.response, formField)
        if (!validation.valid) {
            abort(400, validation.error)
        }

        updateData.response = validation.value
    }

    // If changing the composite key, check for conflicts
    if (updateData.registration_id || updateData.form_fields_id || updateData.event_id) {
        const newRegistrationId = updateData.registration_id || existingResponse.registration_id
        const newFormFieldId = updateData.form_fields_id || existingResponse.form_fields_id
        const newEventId = updateData.event_id || existingResponse.event_id

        // Only check if the composite key actually changed
        if (
            newRegistrationId !== existingResponse.registration_id ||
            newFormFieldId !== existingResponse.form_fields_id ||
            newEventId !== existingResponse.event_id
        ) {
            const conflict = await registrationResponseRepo.findRegistrationResponseByCompositeKey(
                newRegistrationId,
                newFormFieldId,
                newEventId
            )

            if (conflict && conflict._id !== id) {
                abort(409, 'Câu trả lời cho trường này đã tồn tại với thông tin mới.')
            }
        }
    }

    const updated = await registrationResponseRepo.updateRegistrationResponseById(id, updateData)
    if (!updated) {
        abort(500, 'Không thể cập nhật câu trả lời đăng ký.')
    }

    return await registrationResponseRepo.findRegistrationResponseById(id)
}

/**
 * Get registration responses by registration ID (for authenticated user)
 */
export async function getMyRegistrationResponses(registrationId) {
    return await registrationResponseRepo.findRegistrationResponsesByRegistrationId(registrationId)
}

/**
 * Get registration responses by event ID
 */
export async function getRegistrationResponsesByEventId(eventId) {
    return await registrationResponseRepo.findRegistrationResponsesByEventId(eventId)
}

/**
 * Bulk create registration responses with validation
 */
export async function bulkCreateRegistrationResponses(responsesData) {
    const validatedResponses = []
    const errors = []

    for (let i = 0; i < responsesData.length; i++) {
        const data = responsesData[i]

        try {
            // Get the form field to validate the response
            const formField = await formFieldRepo.findFormFieldById(data.form_fields_id)
            if (!formField) {
                errors.push({
                    index: i,
                    error: `Không tìm thấy trường form với ID: ${data.form_fields_id}`
                })
                continue
            }

            // Validate the response against the field type
            const validation = validateResponseByFieldType(data.response, formField)
            if (!validation.valid) {
                errors.push({
                    index: i,
                    field_id: data.form_fields_id,
                    error: validation.error
                })
                continue
            }

            validatedResponses.push({
                ...data,
                response: validation.value
            })
        } catch (error) {
            errors.push({
                index: i,
                error: error.message
            })
        }
    }

    if (errors.length > 0) {
        abort(400, 'Có lỗi xác thực trong dữ liệu', { errors })
    }

    return await registrationResponseRepo.bulkCreateRegistrationResponses(validatedResponses)
}
