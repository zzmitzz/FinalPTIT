import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import * as organizerDetailsController from '@/app/controllers/organizer/organizer-details.controller'
import * as organizerDetailsRequest from '@/app/requests/organizor/organizer-details.request'
import requireOrganizerAuthentication from '@/app/middleware/organizor/require-authentication'

const organizerDetailsRouter = Router()

// Create organizer details (authenticated organizer only)
organizerDetailsRouter.post('/',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(organizerDetailsRequest.createItem)),
    asyncHandler(organizerDetailsController.createOrganizerDetails)
)

// Get current organizer's details (authenticated organizer only)
organizerDetailsRouter.get('/me',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(organizerDetailsController.getOrganizerDetails)
)

// Get all organizer details (with pagination)
organizerDetailsRouter.get('/',
    asyncHandler(organizerDetailsController.getAllOrganizerDetails)
)

// Get organizer details by organizer ID (public)
organizerDetailsRouter.get('/:organizerId',
    asyncHandler(organizerDetailsController.getOrganizerDetailsById)
)

// Update current organizer's details (authenticated organizer only)
organizerDetailsRouter.put('/',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(organizerDetailsRequest.updateItem)),
    asyncHandler(organizerDetailsController.updateOrganizerDetails)
)

// Delete current organizer's details (authenticated organizer only)
organizerDetailsRouter.delete('/',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(organizerDetailsController.deleteOrganizerDetails)
)

// Upsert (create or update) current organizer's details (authenticated organizer only)
organizerDetailsRouter.post('/upsert',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(organizerDetailsRequest.createItem)),
    asyncHandler(organizerDetailsController.upsertOrganizerDetails)
)

export default organizerDetailsRouter

