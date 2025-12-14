import * as formRepo from '@/db/form_repository'
import * as formFieldRepo from '@/db/form_fields'

/**
 * Create a form with its associated fields
 * @param {Object} data - Form data including fields array
 * @param {string} data.event_id - Event ID
 * @param {string} data.title - Form title
 * @param {string} data.description - Form description
 * @param {boolean} data.is_public - Whether form is public
 * @param {Array} data.fields - Array of form fields
 * @returns {Promise<Object>} Created form with fields
 */
export async function createFormWithFields(data) {
    const { event_id, title, description, is_public, fields } = data

    // Create the form first
    const formData = {
        event_id,
        title,
        description,
        is_public,
    }

    const createdForm = await formRepo.createForm(formData)

    // Create all form fields
    const createdFields = []
    for (const field of fields) {
        const fieldData = {
            form_id: createdForm._id,
            field_label: field.field_label,
            field_description: field.field_description || '',
            field_type: field.field_type,
            field_options: field.field_options || [],
            field_has_other_option: field.field_has_other_option || false,
            field_range: field.field_range || { min: null, max: null },
            field_extensions: field.field_extensions || [],
            required: field.required || false,
            is_primary_key: field.is_primary_key || false,
            can_edit: field.can_edit !== undefined ? field.can_edit : true,
            position: field.position,
        }

        const createdField = await formFieldRepo.createFormField(fieldData)
        createdFields.push(createdField)
    }

    return {
        form: createdForm,
        fields: createdFields,
    }
}

export async function getFormById(id) {
    const form = await formRepo.findFormById(id)
    if (!form) {
        return null
    }

    // Get all form fields associated with this form
    const fields = await formFieldRepo.findFormFieldsByFormId(id)

    return {
        ...form,
        fields
    }
}

export async function getFormByEventId(eventId) {
    const form = await formRepo.findFormByEventId(eventId)
    if (!form) return null
    const fields = await formFieldRepo.findFormFieldsByFormId(form._id)
    return { ...form, fields }
}

export async function getFormsByEventId(eventId) {
    const forms = await formRepo.findFormsByEventId(eventId)
    return forms
}

export async function getFormsByEventIdAndIsPublic(eventId) {
    const forms = await formRepo.findFormByEventId(eventId)
    if (forms.is_public) {
        return forms
    }
    return null
}

export async function getFullFormPublic(eventId) {
    const form = await formRepo.findFormByEventIdAndIsPublic(eventId)
    if (form) {
        const fields = await formFieldRepo.findFormFieldsByFormId(form._id)
        return { ...form, fields }
    }
    return null
}

export async function updateForm(id, updateData) {
    const updated = await formRepo.updateFormById(id, updateData)
    if (!updated) {
        return null
    }
    return await formRepo.findFormById(id)
}

/**
 * Update form with fields
 * @param {string} id - Form ID
 * @param {Object} data - Update data including fields array
 * @returns {Promise<Object>} Updated form with fields
 */
export async function updateFormWithFields(id, data) {
    const { title, description, is_public, fields } = data

    // Update the form metadata
    const formData = { title, description, is_public }
    const updatedForm = await formRepo.updateFormById(id, formData)

    if (!updatedForm) {
        return null
    }

    // If fields are provided, update them
    if (fields && Array.isArray(fields)) {
        // Get existing fields
        const existingFields = await formFieldRepo.findFormFieldsByFormId(id)
        const existingFieldIds = new Set(existingFields.map(f => f._id))

        // Track which fields are in the update
        const updatedFieldIds = new Set()

        for (const field of fields) {
            const fieldData = {
                field_label: field.field_label,
                field_description: field.field_description || '',
                field_type: field.field_type,
                field_options: field.field_options || [],
                field_has_other_option: field.field_has_other_option || false,
                field_range: field.field_range || { min: null, max: null },
                field_extensions: field.field_extensions || [],
                required: field.required || false,
                is_primary_key: field.is_primary_key || false,
                can_edit: field.can_edit !== undefined ? field.can_edit : true,
                position: field.position,
            }

            if (field._id && existingFieldIds.has(field._id)) {
                // Update existing field
                await formFieldRepo.updateFormFieldById(field._id, fieldData)
                updatedFieldIds.add(field._id)
            } else {
                // Create new field
                const newFieldData = { ...fieldData, form_id: id }
                const created = await formFieldRepo.createFormField(newFieldData)
                updatedFieldIds.add(created._id)
            }
        }

        // Delete fields that were removed (only non-primary fields)
        for (const existingField of existingFields) {
            if (!updatedFieldIds.has(existingField._id) && !existingField.is_primary_key) {
                await formFieldRepo.deleteFormFieldById(existingField._id)
            }
        }
    }

    // Return updated form with fields
    const updatedFields = await formFieldRepo.findFormFieldsByFormId(id)
    return {
        ...updatedForm,
        fields: updatedFields
    }
}

export async function deleteForm(id) {
    // Delete associated form fields first
    await formFieldRepo.deleteFormFieldsByFormId(id)
    // Then delete the form
    return await formRepo.deleteFormById(id)
}

