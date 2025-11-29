import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order System Backend API",
      version: "1.0.0",
      description: "API documentation for the Order System Backend",
    },
    servers: [
      {
        url: process.env.SERVER_URL,
        description: "Real-Time Order Management + Payment System + AI Chatbot",
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
      schemas: {
        // Auth Schemas
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "role"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "SecurePass123!",
              description:
                "Must contain uppercase, lowercase, number & special character",
            },
            role: {
              type: "string",
              enum: ["admin", "user"],
              example: "user",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "SecurePass123!",
            },
          },
        },
        // Order Schemas
        OrderItem: {
          type: "object",
          required: ["title", "price", "quantity"],
          properties: {
            title: {
              type: "string",
              minLength: 1,
              example: "Product Name",
            },
            price: {
              type: "number",
              format: "float",
              minimum: 0,
              example: 99.99,
            },
            quantity: {
              type: "integer",
              minimum: 1,
              example: 2,
            },
          },
        },
        CreateOrderRequest: {
          type: "object",
          required: ["items", "paymentMethod", "paymentFlow"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: {
                $ref: "#/components/schemas/OrderItem",
              },
            },
            paymentMethod: {
              type: "string",
              enum: ["stripe", "paypal"],
              example: "stripe",
            },
            paymentFlow: {
              type: "string",
              enum: ["frontend", "backend"],
              example: "frontend",
            },
          },
        },
        UpdateOrderStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              example: "processing",
            },
          },
        },
        // Chatbot Schemas
        ChatRequest: {
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "string",
              minLength: 1,
              example: "What is the status of my order?",
            },
          },
        },
        // Response Schemas
        SuccessResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error description",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
