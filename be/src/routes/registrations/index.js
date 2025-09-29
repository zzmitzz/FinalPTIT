import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'

const registrationsRouter = Router()

registrationsRouter.use('/auth', authRouter)
registrationsRouter.use('/users', userRouter)

export default registrationsRouter 