import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import * as eventController from '@/app/controllers/organizer/event.controller'
import * as eventRequest from '@/app/requests/organizer/event.request'
import requireOrganizerAuthentication from '@/app/middleware/organizor/require-authentication'

const eventRouter = Router()

// Create event
eventRouter.post('/',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(eventRequest.createItem)),
    asyncHandler(eventController.createEvent)
)

// Get event by ID
eventRouter.get('/:id',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(eventController.getEventById)
)

// Update event
eventRouter.put('/:id',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(validate(eventRequest.updateItem)),
    asyncHandler(eventController.updateEvent)
)

// Delete event
eventRouter.delete('/:id',
    asyncHandler(requireOrganizerAuthentication),
    asyncHandler(eventController.deleteEvent)
)

eventRouter.post('/add-form/:id',
    asyncHandler(requireOrganizerAuthentication),
)

export default eventRouter
