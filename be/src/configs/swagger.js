const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Management API',
            version: '1.0.0',
            description: 'API documentation for Event Management System with Admin, Organizer, and Registration modules',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Success message'
                        }
                    }
                },
                AuthToken: {
                    type: 'object',
                    properties: {
                        access_token: {
                            type: 'string',
                            description: 'JWT access token'
                        },
                        expire_in: {
                            type: 'number',
                            description: 'Token expiration time in seconds'
                        },
                        auth_type: {
                            type: 'string',
                            description: 'Authentication type'
                        }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        total: {
                            type: 'number',
                            description: 'Total number of items'
                        },
                        page: {
                            type: 'number',
                            description: 'Current page number'
                        },
                        per_page: {
                            type: 'number',
                            description: 'Items per page'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/**/*.js']
}

export default swaggerOptions
