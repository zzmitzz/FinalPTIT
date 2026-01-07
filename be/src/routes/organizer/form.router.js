import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import requireOrganizerAuthentication, {
    requireOrganizerPermission,
} from '@/app/middleware/organizer/require-authentication'
import * as formRequest from '@/app/requests/organizer/form.request'
import * as formController from '@/app/controllers/organizer/form.controller'

const router = Router()

// all routes require organizer authentication
router.use(asyncHandler(requireOrganizerAuthentication))

// Create form with fields
router.post(
    '/',
    asyncHandler(requireOrganizerPermission('FORM:CREATE', 'FORM:MANAGE')),
    asyncHandler(validate(formRequest.createFormWithFields)),
    asyncHandler(formController.createFormWithFields)
)

// Get form by id
router.get('/:id', asyncHandler(formController.getForm))

// Get form by event id
router.get('/event/:eventId', asyncHandler(formController.getFormByEvent))

// Update form
router.put(
    '/:id',
    asyncHandler(requireOrganizerPermission('FORM:UPDATE', 'FORM:MANAGE')),
    asyncHandler(validate(formRequest.updateForm)),
    asyncHandler(formController.updateForm)
)

// Update form with fields
router.put(
    '/:id/with-fields',
    asyncHandler(requireOrganizerPermission('FORM:UPDATE', 'FORM:MANAGE')),
    asyncHandler(validate(formRequest.updateFormWithFields)),
    asyncHandler(formController.updateFormWithFields)
)

// Delete form
router.delete(
    '/:id',
    asyncHandler(requireOrganizerPermission('FORM:DELETE', 'FORM:MANAGE')),
    asyncHandler(formController.deleteForm)
)

export default router
