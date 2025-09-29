import adminRouter from './admin'
import organizorRouter from './organizor'
import registrationsRouter from './registrations'

function route(app) {
    app.use('/admin', adminRouter)
    app.use('/organizor', organizorRouter)
    app.use('/registrations', registrationsRouter)
}

export default route
