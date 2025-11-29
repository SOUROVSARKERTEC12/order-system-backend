// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";

// Import Routes
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/orders.routes";
import paymentRoutes from "./routes/payment.routes";
import chatbotRoutes from "./routes/chatbot.routes";

// Import Utils & Middlewares
import { errorHandler } from "./utils/error.handler";
import { SocketService } from "./socket/socket.service";
import "./queues/email.worker";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware";

// Redis connection
import "./config/redis.config";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";

const app = express();

// 1. Create a single HTTP server (Express + HTTP)
const server = createServer(app);

SocketService.getInstance().init(server);

app.use("/payments", paymentRoutes);
// 3. Express Global Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(globalRateLimiter);
// 4. API Routes
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic Health Check Route
app.get("/", (req, res) => {
  res.send("Order System Backend is running");
});

// 5. Error Handler (Must be after routes)
app.use(errorHandler);

export { app, server };
