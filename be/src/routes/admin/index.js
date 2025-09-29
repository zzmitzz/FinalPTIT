import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'


const adminRouter = Router()

adminRouter.use('/auth', authRouter)
adminRouter.use('/users', userRouter)


export default adminRouter