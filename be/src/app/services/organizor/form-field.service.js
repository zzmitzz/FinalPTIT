import * as formFieldRepo from '@/db/form_fields'

export async function createFormField(data) {
    return await formFieldRepo.createFormField(data)
}

export async function getFormFieldById(id) {
    return await formFieldRepo.findFormFieldById(id)
}

export async function getFormFieldsByFormId(formId) {
    return await formFieldRepo.findFormFieldsByFormId(formId)
}

export async function updateFormField(id, updateData) {
    const updated = await formFieldRepo.updateFormFieldById(id, updateData)
    if (!updated) {
        return null
    }
    return await formFieldRepo.findFormFieldById(id)
}

export async function deleteFormField(id) {
    return await formFieldRepo.deleteFormFieldById(id)
}

export async function deleteFormFieldsByFormId(formId) {
    return await formFieldRepo.deleteFormFieldsByFormId(formId)
}

export async function countFormFieldsByFormId(formId) {
    return await formFieldRepo.countFormFieldsByFormId(formId)
}

