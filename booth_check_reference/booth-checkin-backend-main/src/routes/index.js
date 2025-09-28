import adminRouter from './admin'
import boothRouter from './booth.router'
import formRouter from './form.router'
import organizerRouter from './organizer'
import registrationRouter from './registration.router'

function route(app) {
    app.use('/', organizerRouter)
    app.use('/admin', adminRouter)
    app.use('/form', formRouter)
    app.use('/booth', boothRouter)
    app.use('/registration', registrationRouter)
}

export default route
