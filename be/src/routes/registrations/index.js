import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'
import eventRouter from './event.router'

const registrationsRouter = Router()

registrationsRouter.use('/auth', authRouter)
registrationsRouter.use('/events', eventRouter)
registrationsRouter.use('/users', userRouter)

export default registrationsRouter