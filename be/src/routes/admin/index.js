import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'
import statsRouter from './stats.router'
import organizersRouter from './organizers.router'
import eventsRouter from './events.router'


const adminRouter = Router()

adminRouter.use('/auth', authRouter)
adminRouter.use('/users', userRouter)
adminRouter.use('/stats', statsRouter)
adminRouter.use('/organizers', organizersRouter)
adminRouter.use('/events', eventsRouter)


export default adminRouter