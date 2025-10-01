import { Router } from 'express'
import eventController from '../../controllers/event.controller'

const eventRouter = Router()

eventRouter.post('/', eventController.createEvent)
eventRouter.get('/:id', eventController.getEventById)
eventRouter.put('/:id', eventController.updateEventById)
eventRouter.delete('/:id', eventController.deleteEventById)

export default eventRouter
