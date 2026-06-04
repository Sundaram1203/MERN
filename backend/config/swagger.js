const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Module API",
      version: "1.0.0",
      description: "REST API for User Authentication and Management"
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4444}`,
        description: "Development server"
      }
    ]
  },
  apis: ["./routes/*.js"]
};

module.exports = swaggerJsdoc(options);
