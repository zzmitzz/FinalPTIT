import { abort } from '@/utils/helpers'
import * as formService from '@/app/services/organizer/form.service'

/**
 * Create a form with fields for an event
 * POST /organizer/events/forms
 */
export async function createFormWithFields(req, res) {
    const result = await formService.createFormWithFields(req.body)
    res.status(201).jsonify(result, 'Tạo form và các trường thành công.')
}

/**
 * Get form by ID
 * GET /organizer/events/forms/:id
 */
export async function getForm(req, res) {
    const form = await formService.getFormById(req.params.id)
    if (!form) {
        abort(404, 'Không tìm thấy form.')
    }
    res.jsonify(form)
}

/**
 * Get form by event ID
 * GET /organizer/events/forms/event/:eventId
 */
export async function getFormByEvent(req, res) {
    const { eventId } = req.params
    const form = await formService.getFormByEventId(eventId)
    if (!form) return res.status(404).send({ message: 'Form not found for event' })
    res.send(form)
}

/**
 * Update form
 * PUT /organizer/events/forms/:id
 */
export async function updateForm(req, res) {
    const form = await formService.updateForm(req.params.id, req.body)
    if (!form) {
        abort(404, 'Không tìm thấy form.')
    }
    res.jsonify(form, 'Cập nhật form thành công.')
}

/**
 * Update form with fields
 * PUT /organizer/events/forms/:id/with-fields
 */
export async function updateFormWithFields(req, res) {
    const result = await formService.updateFormWithFields(req.params.id, req.body)
    if (!result) {
        abort(404, 'Không tìm thấy form.')
    }
    res.jsonify(result, 'Cập nhật form và các trường thành công.')
}

/**
 * Delete form
 * DELETE /organizer/events/forms/:id
 */
export async function deleteForm(req, res) {
    const deleted = await formService.deleteForm(req.params.id)
    if (!deleted) {
        abort(404, 'Không tìm thấy form.')
    }
    res.status(204).send()
}

