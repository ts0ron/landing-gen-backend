# Places API Backend Service

A TypeScript-based Express backend service that integrates with Google Maps Places API and OpenAI to provide enhanced place information and AI-generated descriptions.

## Features

- 🔐 JWT-based Authentication
- 🗺️ Google Maps Places API Integration
- 🤖 OpenAI Integration for Place Descriptions
- 📝 Swagger/OpenAPI Documentation
  - Interactive API documentation
  - Built-in API testing interface
  - Request/Response examples
  - Authentication documentation
- 🪵 Winston-based Logging
- 🔍 TypeScript Type Safety
- 📊 MongoDB Database
- 🚀 GitHub Actions CI/CD

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Google Maps API Key
- OpenAI API Key

## Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/landing-gen-backend.git
cd landing-gen-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/places_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=24h

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Logging Configuration
LOG_LEVEL=debug
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## API Documentation

The API is documented using Swagger/OpenAPI Specification. Once the server is running, you can access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

The Swagger UI provides:

- Detailed API endpoint documentation
- Request/Response schemas
- Interactive API testing interface
- Authentication requirements
- Example requests and responses

For more information about Swagger/OpenAPI, visit their [official documentation](https://swagger.io/docs/).

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

Before deploying, you need to set up the following secrets in your GitHub repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password

### Deployment Process

The service uses GitHub Actions for CI/CD. The workflow will:

1. Run tests and linting
2. Build the Docker image
3. Push the image to Docker Hub
4. Deploy to the target environment

To deploy manually:

1. Build the Docker image:

```bash
docker build -t your-username/landing-gen-backend:latest .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env your-username/landing-gen-backend:latest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
