import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import requireOrganizerAuthentication from '@/app/middleware/organizer/require-authentication'
import * as placeController from '@/app/controllers/organizer/place.controller'

const placeRouter = Router()

placeRouter.use(asyncHandler(requireOrganizerAuthentication))

// Create a place (room) for an event
placeRouter.post('/', asyncHandler(placeController.createPlace))

// List places for an event
placeRouter.get('/event/:eventId', asyncHandler(placeController.listPlacesByEvent))

// Delete place by id
placeRouter.delete('/:id', asyncHandler(placeController.deletePlace))

export default placeRouter
