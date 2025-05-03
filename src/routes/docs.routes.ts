import { Router } from "express";
import swaggerJSDoc from "swagger-jsdoc";

// Import swaggerOptions from app or move it to a shared file if needed
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pagenerate API",
      version: "1.0.0",
      description:
        "API for managing places using Google Maps Place API and OpenAI",
    },
    servers: [
      {
        url: process.env.APP_HOSTNAME || "",
        description:
          process.env.NODE_ENV === "production"
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

const router = Router();
const swaggerSpec = swaggerJSDoc(swaggerOptions);

router.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

export default router;
