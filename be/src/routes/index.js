import adminRouter from './admin'
import organizerRouter from './organizer'
import registrationsRouter from './registrations'

function route(app) {
    app.use('/admin', adminRouter)
    app.use('/organizer', organizerRouter)
    app.use('/registrations', registrationsRouter)
}

export default route
