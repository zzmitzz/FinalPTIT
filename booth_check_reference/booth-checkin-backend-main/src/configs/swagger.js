import path from 'path'

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Booth Check-in API',
            version: '1.0.0',
            description: 'API documentation for Booth Check-in system',
            contact: {
                name: 'API Support',
            },
            license: {
                name: 'MIT',
            },
        },
        servers: [
            {
                url: 'https://api-boothcheckin.ptitiec.xyz',
                description: 'Production server',
                default: true
            },
            {
                url: 'http://localhost:3456',
                description: 'Development server',
            },
            
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        path.join(__dirname, '../routes/**/*.js'),
        path.join(__dirname, '../app/controllers/**/*.js'),
        path.join(__dirname, '../models/**/*.js'),
    ],
}

export default swaggerOptions 