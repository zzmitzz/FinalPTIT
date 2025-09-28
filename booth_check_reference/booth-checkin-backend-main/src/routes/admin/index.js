import {Router} from 'express'
import authRouter from './auth.router'
import roleRouter from './role.router'
import adminManagementRouter from './admin-management.router'
import organizerRouter from './organizer.router'
import eventRouter from './event.router'
import boothRouter from './booth.router'
import dashboardRouter from './dashboard.router'

const adminRouter = Router()

adminRouter.use('/', authRouter)
adminRouter.use('/roles', roleRouter)
adminRouter.use('/admin-management', adminManagementRouter)
adminRouter.use('/organizers', organizerRouter)
adminRouter.use('/events', eventRouter)
adminRouter.use('/booths', boothRouter)
adminRouter.use('/dashboard', dashboardRouter)

export default adminRouter
