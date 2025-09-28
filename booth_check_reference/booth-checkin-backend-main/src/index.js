import express from 'express'
import path from 'path'
import serveFavicon from 'serve-favicon'
import helmet from 'helmet'
import multer from 'multer'
import ejs from 'ejs'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { APP_DEBUG, NODE_ENV, PUBLIC_DIR, VIEW_DIR, swaggerOptions } from './configs'

import jsonify from './handlers/response.handler'
import corsHandler from './handlers/cors.handler'
import httpRequestHandler from './handlers/http-request.handler'
import limiter from './handlers/rate-limit.handler'
import formDataHandler from './handlers/form-data.handler'
import notFoundHandler from './handlers/not-found.handler'
import errorHandler from './handlers/error.handler'

import route from './routes'
import './crons/email-batch-sender'

function createApp() {
    // Init app
    const app = express()

    app.response.jsonify = jsonify

    app.set('env', NODE_ENV)
    
    app.use(corsHandler)
    app.set('trust proxy', 1)
    app.set('views', VIEW_DIR)
    app.set('view engine', 'ejs')
    app.engine('html', ejs.renderFile)

    if (APP_DEBUG) {
        app.use(httpRequestHandler)
    }
    app.use(limiter)
    app.use(serveFavicon(path.join(PUBLIC_DIR, 'favicon.ico')))
    app.use('/static', express.static(PUBLIC_DIR))
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                upgradeInsecureRequests: null
            },
        },
    }))
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true, limit: '50mb' }))
    app.use(multer({ storage: multer.memoryStorage() }).any())
    app.use(formDataHandler)

    // Swagger documentation
    const swaggerDocs = swaggerJsDoc(swaggerOptions)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Booth Check-in API Documentation'
    }))

    // Init routes
    route(app)

    // Not found handler
    app.use(notFoundHandler)

    // Error handler
    app.use(errorHandler)

    return app
}

export default createApp
