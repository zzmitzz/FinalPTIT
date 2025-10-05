import {abort} from '@/utils/helpers'
import * as formFieldService from '@/app/services/organizer/form-field.service'

export async function createItem(req, res) {
    const formField = await formFieldService.createFormField(req.body)
    res.status(201).jsonify(formField, 'Tạo trường form thành công.')
}

export async function getItem(req, res) {
    const formField = await formFieldService.getFormFieldById(req.params.id)
    if (!formField) {
        abort(404, 'Không tìm thấy trường form.')
    }
    res.jsonify(formField)
}

export async function getListByFormId(req, res) {
    const formFields = await formFieldService.getFormFieldsByFormId(req.query.form_id)
    const total = await formFieldService.countFormFieldsByFormId(req.query.form_id)
    res.jsonify({
        data: formFields,
        total: total,
    })
}

export async function updateItem(req, res) {
    const formField = await formFieldService.getFormFieldById(req.params.id)
    if (!formField) {
        abort(404, 'Không tìm thấy trường form.')
    }

    // Check if field can be edited
    if (!formField.can_edit) {
        abort(400, 'Trường này không thể chỉnh sửa.')
    }

    const updated = await formFieldService.updateFormField(req.params.id, req.body)
    res.jsonify(updated, 'Cập nhật trường form thành công.')
}

export async function deleteItem(req, res) {
    const formField = await formFieldService.getFormFieldById(req.params.id)
    if (!formField) {
        abort(404, 'Không tìm thấy trường form.')
    }

    // Check if field can be edited (deleted)
    if (!formField.can_edit) {
        abort(400, 'Trường này không thể xóa.')
    }

    await formFieldService.deleteFormField(req.params.id)
    res.jsonify('Xóa trường form thành công.')
}

export async function deleteByFormId(req, res) {
    const deletedCount = await formFieldService.deleteFormFieldsByFormId(req.params.formId)
    res.jsonify(`Đã xóa ${deletedCount} trường form.`)
}

