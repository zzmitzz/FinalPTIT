import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as utilsController from '@/app/controllers/utils.controller'

const utilsRouter = Router()

// Public route for reverse geocoding
utilsRouter.get('/reverse-geocode', asyncHandler(utilsController.reverseGeocode))

export default utilsRouter
