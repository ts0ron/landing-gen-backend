import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { config } from "./config/env.config";
import { connectDB } from "./config/db.config";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Environment enum
enum Env {
  Production = "production",
  Development = "development",
}

// Import routes
import authRoutes from "./routes/auth.routes";
import placeRoutes from "./routes/place.routes";

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Places API",
      version: "1.0.0",
      description:
        "API for managing places using Google Maps Place API and OpenAI",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === Env.Production
            ? "https://app.hostname.com"
            : `http://localhost:${config.PORT}`,
        description:
          process.env.NODE_ENV === Env.Production
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger documentation at both /docs and /api/docs
const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }", // Hide the top bar
  customSiteTitle: "Places API Documentation",
};

app.use(["/docs", "/api/docs"], swaggerUi.serve);
app.get(["/docs", "/api/docs"], swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
