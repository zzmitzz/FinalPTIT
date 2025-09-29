
import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'

const organizorRouter = Router()

organizorRouter.use('/auth', authRouter)
organizorRouter.use('/users', userRouter)

export default organizorRouter