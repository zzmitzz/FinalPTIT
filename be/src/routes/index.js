import adminRouter from './admin'
import organizerRouter from './organizer'
import registrationsRouter from './registrations'

function route(app) {
    // Kubernetes healthcheck endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'ptit-backend',
        })
    })

    app.use('/admin', adminRouter)
    app.use('/organizer', organizerRouter)
    app.use('/registrations', registrationsRouter)
}

export default route
