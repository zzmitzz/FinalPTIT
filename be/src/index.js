import express from 'express'
import path from 'path'
import serveFavicon from 'serve-favicon'
import helmet from 'helmet'
import multer from 'multer'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {APP_DEBUG, NODE_ENV, PUBLIC_DIR, VIEW_DIR, swaggerOptions} from './configs'

import {jsonify, sendMail} from './handlers/response.handler'
import corsHandler from './handlers/cors.handler'
import httpRequestHandler from './handlers/http-request.handler'
import limiter from './handlers/rate-limit.handler'
import formDataHandler from './handlers/form-data.handler'
import initLocalsHandler from './handlers/init-locals.handler'
import notFoundHandler from './handlers/not-found.handler'
import errorHandler from './handlers/error.handler'
import morgan from 'morgan';

import route from './routes'

function createApp() {
    // Init app
    const app = express()

    app.response.jsonify = jsonify
    app.response.sendMail = sendMail

    app.set('env', NODE_ENV)
    app.set('trust proxy', 1)
    app.set('views', VIEW_DIR)
    app.set('view engine', 'ejs')

    app.use(corsHandler)
    if (APP_DEBUG) {
        app.use(httpRequestHandler)
    }
    app.use(limiter)
    app.use(serveFavicon(path.join(PUBLIC_DIR, 'favicon.ico')))
    app.use('/static', express.static(PUBLIC_DIR))
    app.use(helmet())
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))


    app.use(multer({storage: multer.memoryStorage()}).any())
    app.use(formDataHandler)
    app.use(initLocalsHandler)
    app.use(morgan("dev"));

    // Swagger documentation
    const swaggerDocs = swaggerJsDoc(swaggerOptions)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        customSiteTitle: 'Event Management API Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
    }))

    route(app)

    // Not found handler
    app.use(notFoundHandler)

    // Error handler
    app.use(errorHandler)

    return app
}

export default createApp
