
import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'
import eventRouter from './event.router'
import formFieldRouter from './form-field.router'
import organizerDetailsRouter from './organizer-details.router'

const organizerRouter = Router()

organizerRouter.use('/auth', authRouter)
organizerRouter.use('/users', userRouter)
organizerRouter.use('/events', eventRouter)
organizerRouter.use('/form-fields', formFieldRouter)
organizerRouter.use('/details', organizerDetailsRouter)

export default organizerRouter