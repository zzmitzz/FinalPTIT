import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import requireRegistrationAuthentication from '@/app/middleware/registrations/require-authentication'
import * as eventController from '@/app/controllers/registrations/event.controller'
import * as speakerController from '@/app/controllers/registrations/speaker.controller'

const eventRouter = Router()

// All routes require registration authentication
eventRouter.use(asyncHandler(requireRegistrationAuthentication))

// Mirror GET endpoints from organizer events for registrations context
eventRouter.get('/', asyncHandler(eventController.listEvents))
eventRouter.get('/search', asyncHandler(eventController.searchEvents))
eventRouter.get('/nearby', asyncHandler(eventController.getNearbyEvents))
eventRouter.get('/pin/:pinCode', asyncHandler(eventController.getEventByPinCode))
eventRouter.get('/:id/register', asyncHandler(eventController.registerEvent))
eventRouter.get('/:id', asyncHandler(eventController.getEventById))
eventRouter.get('/:id/registered', asyncHandler(eventController.getRegistrationStatus))

// Speaker routes
eventRouter.get('/speakers/:id', asyncHandler(speakerController.getSpeakerById))
eventRouter.get('/speakers/:id/sessions', asyncHandler(speakerController.getSessionsBySpeakerId))

export default eventRouter

