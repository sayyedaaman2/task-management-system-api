import swaggerJsdoc from "swagger-jsdoc";

const isProd = process.env.NODE_ENV === "production";

const apiFiles = isProd ? ["./dist/routes/*.js"] : ["./src/routes/*.ts"];

const rootFiles = isProd ? ["./dist/app.js"] : ["./src/app.ts"];

const baseDefinition = {
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export const apiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management System API",
      version: "1.0.0",
      description: "Production-level Task Management REST API",
    },
    servers: [{ url: "/api/v1", description: "API v1" }],
    ...baseDefinition,
  },
  apis: apiFiles,
});

export const rootSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management System API",
      version: "1.0.0",
      description: "Health & Root endpoints",
    },
    servers: [{ url: "/", description: "Root" }],
    ...baseDefinition,
  },
  apis: rootFiles,
});
