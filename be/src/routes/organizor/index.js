
import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'
import eventRouter from './event.router'
import formFieldRouter from './form-field.router'
import organizerDetailsRouter from './organizer-details.router'

const organizorRouter = Router()

organizorRouter.use('/auth', authRouter)
organizorRouter.use('/users', userRouter)
organizorRouter.use('/events', eventRouter)
organizorRouter.use('/form-fields', formFieldRouter)
organizorRouter.use('/details', organizerDetailsRouter)

export default organizorRouter