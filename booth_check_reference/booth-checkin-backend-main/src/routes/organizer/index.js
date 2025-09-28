import {Router} from 'express'
import authRouter from './auth.router'
import eventRouter from './event.router'
import boothRouter from './booth.router'
import prizeRouter from './prize.router'

const organizerRouter = Router()

organizerRouter.use('/', authRouter)
organizerRouter.use('/events', eventRouter)
organizerRouter.use('/booths', boothRouter)
organizerRouter.use('/prizes', prizeRouter)
export default organizerRouter
