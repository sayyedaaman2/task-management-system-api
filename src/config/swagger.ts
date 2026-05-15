import swaggerJsdoc from "swagger-jsdoc";

const isProd = process.env.NODE_ENV === "production";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management System API",
      version: "1.0.0",
      description: "Production-level Task Management REST API",
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
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
    security: [{ bearerAuth: [] }],
  },
  apis: isProd ? ["./dist/routes/*.js", "./dist/app.js"] : ["./src/routes/*.ts", "./src/app.ts"],
};

export default swaggerJsdoc(options);
