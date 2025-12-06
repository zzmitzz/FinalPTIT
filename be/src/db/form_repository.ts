
import Form from '../model/form'


interface FormData {
    _id: string
    event_id: string
    title: string
    description: string
    is_public: boolean
}

interface FormUpdateData extends Partial<FormData> { }

export const createForm = async (form: any) => {
    try {
        const newForm = await Form.create(form)
        return newForm.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create form: ${errorMsg}`)
    }
}

export const findFormById = async (id: string) => {
    try {
        const form = await Form.findByPk(id)
        return form?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find form by ID: ${errorMsg}`)
    }
}

export const findFormByEventId = async (eventId: string) => {
    try {
        const form = await Form.findOne({ where: { event_id: eventId } })
        return form?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find form by event ID: ${errorMsg}`)
    }
}

export const updateFormById = async (id: string, updateData: FormUpdateData) => {
    try {
        const [updatedRows] = await Form.update(updateData, { where: { _id: id } })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update form: ${errorMsg}`)
    }
}

export const deleteFormById = async (id: string) => {
    try {
        const deletedRows = await Form.destroy({ where: { _id: id } })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete form: ${errorMsg}`)
    }
}

export const deleteFormByEventId = async (eventId: string) => {
    try {
        const deletedRows = await Form.destroy({ where: { event_id: eventId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete form by event ID: ${errorMsg}`)
    }
}
