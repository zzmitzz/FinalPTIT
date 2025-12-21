import { Router } from 'express'

import authRouter from './auth.router'
import userRouter from './user.router'
import eventRouter from './event.router'
import registrationResponseRouter from './registration-response.router'
import registrationRegisterEventRouter from './registration-register-event.router'
import sessionRegistrationRouter from './session-registration.router'
import resourceRouter from './resource.route'
import deviceRouter from './device.router'

const registrationsRouter = Router()

registrationsRouter.use('/auth', authRouter)
registrationsRouter.use('/events', eventRouter)
registrationsRouter.use('/users', userRouter)
registrationsRouter.use('/responses', registrationResponseRouter)
registrationsRouter.use('/registered-events', registrationRegisterEventRouter)
registrationsRouter.use('/session-registrations', sessionRegistrationRouter)
registrationsRouter.use('/resources', resourceRouter)
registrationsRouter.use('/devices', deviceRouter)

export default registrationsRouter
