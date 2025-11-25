import adminRouter from './admin'
import organizerRouter from './organizer'
import registrationsRouter from './registrations'
import utilsRouter from './utils.router'

function route(app) {
    app.use('/admin', adminRouter)
    app.use('/organizer', organizerRouter)
    app.use('/registrations', registrationsRouter)
    app.use('/utils', utilsRouter)
}

export default route
