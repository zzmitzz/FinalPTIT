
import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'
import eventRouter from './event.router'
import formFieldRouter from './form-field.router'
import formRouter from './form.router'
import organizerDetailsRouter from './organizer-details.router'
import sessionRouter from './session.router'
import speakerRouter from './speaker.router'
import sessionSpeakerRouter from './session-speaker.router'
import resourceRouter from './resource.router'
import checkinRouter from './checkin.router'
import placeRouter from './place.router'

const organizerRouter = Router()

organizerRouter.use('/auth', authRouter)
organizerRouter.use('/users', userRouter)
organizerRouter.use('/events', eventRouter)
organizerRouter.use('/form-fields', formFieldRouter)
organizerRouter.use('/events/forms', formRouter)
organizerRouter.use('/details', organizerDetailsRouter)
organizerRouter.use('/sessions', sessionRouter)
organizerRouter.use('/speakers', speakerRouter)
organizerRouter.use('/session-speakers', sessionSpeakerRouter)
organizerRouter.use('/resources', resourceRouter)
organizerRouter.use('/places', placeRouter)
organizerRouter.use('/checkins', checkinRouter)

export default organizerRouter