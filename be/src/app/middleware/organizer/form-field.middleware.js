import {abort} from '@/utils/helpers'
import * as formFieldRepo from '@/db/form_fields'

export async function checkFormFieldId(req, res, next) {
    const formField = await formFieldRepo.findFormFieldById(req.params.id)
    if (!formField) {
        abort(404, 'Không tìm thấy trường form.')
    }
    req.formField = formField
    next()
}

