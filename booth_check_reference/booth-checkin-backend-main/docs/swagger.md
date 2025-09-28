# Swagger API Documentation

This project uses Swagger (OpenAPI) for API documentation. Swagger provides a UI that allows you to explore and test the API endpoints.

## Accessing the Swagger Documentation

After starting the application, the Swagger UI is available at:

```
http://localhost:3456/api-docs
```

## Features

The Swagger documentation includes:

1. **API Endpoints**: All the available API routes with their HTTP methods (GET, POST, etc.)
2. **Request Parameters**: Required and optional parameters for each endpoint
3. **Request Bodies**: Schema definitions for data that needs to be sent in requests
4. **Response Schemas**: Structure of the response data
5. **Authentication**: Information about the authentication methods

## Using the Swagger UI

1. **Browse Endpoints**: Endpoints are grouped by tags (Booth, Form, Registration, etc.)
2. **Try It Out**: Click the "Try it out" button on any endpoint to test it directly from the UI
3. **Execute Requests**: Fill in the required parameters and click "Execute" to make a live API call
4. **View Responses**: See the actual responses returned by the API

## Authentication

For protected endpoints, you need to:

1. Use the Authorize button at the top of the Swagger UI
2. Enter your Bearer token (JWT)
3. Click "Authorize" to apply the token to all your requests

## Models

The documentation includes detailed schemas for all the models used in the application:

- Event
- Registration
- Form
- Booth
- and more...

## Extending the Documentation

To add documentation for new endpoints or models:

1. Use JSDoc comments with Swagger annotations above your routes or models
2. Follow the existing patterns in the codebase
3. Restart the application to see the updated documentation

Example:

```javascript
/**
 * @swagger
 * /example:
 *   get:
 *     summary: Example endpoint
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Success
 */
``` 