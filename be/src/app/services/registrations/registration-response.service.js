import * as registrationResponseRepo from '@/db/registration_responses_repository'

export async function createRegistrationResponse(data) {
    return await registrationResponseRepo.createRegistrationResponse(data)
}

export async function getRegistrationResponseById(id) {
    return await registrationResponseRepo.findRegistrationResponseById(id)
}

export async function getRegistrationResponsesByRegistrationId(registrationId) {
    return await registrationResponseRepo.findRegistrationResponsesByRegistrationId(registrationId)
}

export async function getRegistrationResponsesByEventId(eventId) {
    return await registrationResponseRepo.findRegistrationResponsesByEventId(eventId)
}

export async function getRegistrationResponsesByFormFieldId(formFieldId) {
    return await registrationResponseRepo.findRegistrationResponsesByFormFieldId(formFieldId)
}

export async function getRegistrationResponseByCompositeKey(registrationId, formFieldId, eventId) {
    return await registrationResponseRepo.findRegistrationResponseByCompositeKey(
        registrationId,
        formFieldId,
        eventId
    )
}

export async function getAllRegistrationResponses(page = 1, limit = 20) {
    return await registrationResponseRepo.findAllRegistrationResponses(page, limit)
}

export async function countRegistrationResponses() {
    return await registrationResponseRepo.countRegistrationResponses()
}

export async function countRegistrationResponsesByEventId(eventId) {
    return await registrationResponseRepo.countRegistrationResponsesByEventId(eventId)
}

export async function countRegistrationResponsesByRegistrationId(registrationId) {
    return await registrationResponseRepo.countRegistrationResponsesByRegistrationId(registrationId)
}

export async function updateRegistrationResponse(id, updateData) {
    const updated = await registrationResponseRepo.updateRegistrationResponseById(id, updateData)
    if (!updated) {
        return null
    }
    return await registrationResponseRepo.findRegistrationResponseById(id)
}

export async function deleteRegistrationResponse(id) {
    return await registrationResponseRepo.deleteRegistrationResponseById(id)
}

export async function deleteRegistrationResponsesByRegistrationId(registrationId) {
    return await registrationResponseRepo.deleteRegistrationResponsesByRegistrationId(registrationId)
}

export async function deleteRegistrationResponsesByEventId(eventId) {
    return await registrationResponseRepo.deleteRegistrationResponsesByEventId(eventId)
}

export async function bulkCreateRegistrationResponses(dataArray) {
    return await registrationResponseRepo.bulkCreateRegistrationResponses(dataArray)
}

