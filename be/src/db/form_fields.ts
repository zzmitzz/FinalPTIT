import FormFields from "../model/form_fields";
import { FIELD_TYPE } from "../configs/constants";

interface FormFieldData {
    _id: string
    form_id: string
    is_primary_key: boolean
    can_edit: boolean
    field_label: string
    field_description?: string
    field_type: keyof typeof FIELD_TYPE
    field_options: string[]
    field_has_other_option: boolean
    field_range: {
        min: number | null
        max: number | null
    }
    field_extensions: string[]
    required: boolean
    position: number
}

interface FormFieldUpdateData extends Partial<FormFieldData> { }

export const createFormField = async (field: any) => {
    try {
        const newField = await FormFields.create(field)
        return newField.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create form field: ${errorMsg}`)
    }
}

export const findFormFieldById = async (id: string) => {
    try {
        const field = await FormFields.findByPk(id)
        return field?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find form field by ID: ${errorMsg}`)
    }
}

export const findFormFieldsByFormId = async (formId: string) => {
    try {
        const fields = await FormFields.findAll({
            where: { form_id: formId },
            order: [['position', 'ASC']]
        })
        return fields.map(f => f.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find form fields by form ID: ${errorMsg}`)
    }
}

export const updateFormFieldById = async (id: string, updateData: FormFieldUpdateData) => {
    try {
        const [updatedRows] = await FormFields.update(updateData, { where: { _id: id } })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update form field: ${errorMsg}`)
    }
}

export const deleteFormFieldById = async (id: string) => {
    try {
        const deletedRows = await FormFields.destroy({ where: { _id: id } })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete form field: ${errorMsg}`)
    }
}

export const deleteFormFieldsByFormId = async (formId: string) => {
    try {
        const deletedRows = await FormFields.destroy({ where: { form_id: formId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete form fields by form ID: ${errorMsg}`)
    }
}

export const countFormFieldsByFormId = async (formId: string) => {
    try {
        return await FormFields.count({ where: { form_id: formId } })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count form fields: ${errorMsg}`)
    }
}