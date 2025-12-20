import {Router} from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'
import statsRouter from './stats.router'
import organizersRouter from './organizers.router'
import eventsRouter from './events.router'
import systemUsersRouter from './system-users.router'
import rolesRouter from './roles.router'
import permissionsRouter from './permissions.router'
import notificationsRouter from './notifications.router'

const adminRouter = Router()

adminRouter.use('/auth', authRouter)
adminRouter.use('/users', userRouter)
adminRouter.use('/stats', statsRouter)
adminRouter.use('/organizers', organizersRouter)
adminRouter.use('/events', eventsRouter)

// RBAC routes
adminRouter.use('/system-users', systemUsersRouter)
adminRouter.use('/roles', rolesRouter)
adminRouter.use('/permissions', permissionsRouter)

// Notification routes
adminRouter.use('/notifications', notificationsRouter)

export default adminRouter
