# Places API Backend Service

A TypeScript-based Express backend service that integrates with Google Maps Places API and OpenAI to provide enhanced place information and AI-generated descriptions.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Development](#development)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [TODOs](#todos)
- [License](#license)

## Project Overview

This service is designed to enhance place information by combining Google Maps Places API data with AI-generated content. It serves as the backend for the [Landing Page Generator](https://ts0ron.github.io/pagenerate/) application, which creates beautiful landing pages for places of interest.

The service provides:

- Detailed place information from Google Maps
- AI-generated descriptions and content
- User authentication and management
- Place registration and management
- API endpoints for the frontend application

## Features

- 🔐 JWT-based Authentication
- 🗺️ Google Maps Places API Integration
- 🤖 OpenAI Integration for Asset summary & classification
- 📝 Swagger/OpenAPI Documentation
  - Interactive API documentation
  - Request/Response examples
  - Authentication documentation
- 🪵 Winston-based Logging
- 🔍 TypeScript Type Safety
- 📊 MongoDB Database
- 🚀 GitHub branch based deploymentusing Railway

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Google Maps API Key
- OpenAI API Key
- Firebase setup

## Local Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/landing-gen-backend.git
cd landing-gen-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up required services and APIs:

   a. **MongoDB**

   - Install MongoDB locally or use MongoDB Atlas
   - Create a new database for the project
   - Get your connection string

   b. **Google Maps API**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Places API
   - Create API credentials
   - Get your API key

   c. **OpenAI API**

   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Get your API key

   d. **Firebase**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project (or use an existing one)
   - Navigate to Project Settings > Service Accounts
   - Click "Generate new private key" and download the JSON file
   - Copy the following values from the JSON file:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (replace all newlines with `\n` and wrap in double quotes)
   - Go to Project Settings > General > Your apps > Web API Key
     - Copy the API key and set as `FIREBASE_API_KEY`
   - **Enable authentication methods:**
     - In the Firebase Console, go to "Authentication" > "Sign-in method"
     - Enable both **Google** and **Email/Password** authentication providers for your project

4. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Now put your proper credentials at the .env file.

6. Start the development server:

```bash
npm run dev
```

## Live Demo

Check out the live demo of the application at [https://ts0ron.github.io/pagenerate/](https://ts0ron.github.io/pagenerate/)

## Development

Start the development server with hot reload:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## API Documentation

The API is documented using Swagger/OpenAPI Specification. The documentation is available at '/docs' endpoint.

### Backend Documentation

The Swagger UI provides:

- Detailed API endpoint documentation
- Request/Response schemas
- Interactive API testing interface
- Authentication requirements
- Example requests and responses

### Security Considerations

1. In production, consider:

   - Restricting documentation access to authenticated users
   - Adding rate limiting to the documentation endpoints
   - Disabling the "Try it out" feature in production
   - Using environment-specific documentation

2. Add authentication to documentation access:
   ```typescript
   // In your backend
   app.use(
     "/api/docs",
     authenticateUser,
     swaggerUi.serve,
     swaggerUi.setup(swaggerDocument)
   );
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Places

- `GET /api/places/{placeId}` - Get place details
- `POST /api/places/register` - Register a new place
- `GET /api/places/search` - Search places
- `DELETE /api/places/{placeId}` - Delete a place (Admin only)

## Deployment

### Setting up Secrets

Before deploying, you need to set up the following environment variables in Railway, or any other provider:

1. Go to your project in Railway dashboard
2. Navigate to "Variables" tab
3. Add the environment variables as in the skeleton of '.env.example'

### Deployment Process

The service uses Railway for deployment. The deployment process is automated through Railway's GitHub integration, on each 'master' branch update, Railway will automatically:

- Detect the Node.js project
- Install dependencies
- Build the project
- Deploy to Railway's infrastructure

### Monitoring production

Monitor your application:

- Visit Railway dashboard
- Check the "Metrics" tab for performance data
- View deployment status and history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## TODOs

### High Priority

1. Move AI content generation to async progress (scheduled job)

   - Implement a job queue system (e.g., Bull)
   - Create background workers for content generation
   - Add progress tracking and status updates
   - Make the landing page accessible until the job is done (consider how to show the layout without the AI content)

2. Add AI image generator endpoint to create a special design per Asset

   - Integrate with DALL-E or Stable Diffusion API
   - Create image generation queue
   - Implement image optimization and storage

3. Move all secrets to secret manager

   - Implement AWS Secrets Manager or similar
   - Update deployment configuration
   - Add secret rotation policies

4. Create each landing page under subdomain of the main app
   - Set up DNS configuration
   - Implement subdomain routing
   - Add SSL certificate management

### Additional Suggestions

5. Implement rate limiting and API quotas

   - Add Redis for rate limiting
   - Implement usage tracking
   - Add quota management system

6. Add caching layer

   - Add cache invalidation strategies - update asset after some invalidation period.

7. Enhance monitoring and observability

   - Add Prometheus metrics
   - Implement distributed tracing
   - Set up alerting system for errors such as AI generation failures.

8. Improve security

   - Add request validation middleware
   - Implement API key rotation
   - Add security headers
   - Set up WAF (Web Application Firewall)

9. Add automated testing

   - Increase unit test coverage
   - Add integration tests
   - Implement E2E testing
   - Set up performance testing

10. Documentation improvements

    - Add more code examples

11. Admin actions

- Add all Assets layout for admin to manage.
- including deleting an asset.
- marking asset as forbidden - which blocks the app from creating landing page for that asset.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
