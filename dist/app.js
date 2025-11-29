"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
// Import Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const chatbot_routes_1 = __importDefault(require("./routes/chatbot.routes"));
// Import Utils & Middlewares
const error_handler_1 = require("./utils/error.handler");
const socket_service_1 = require("./socket/socket.service");
require("./queues/email.worker");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
// Redis connection
require("./config/redis.config");
const app = (0, express_1.default)();
exports.app = app;
// 1. Create a single HTTP server (Express + HTTP)
const server = (0, http_1.createServer)(app);
exports.server = server;
socket_service_1.SocketService.getInstance().init(server);
app.use("/payments", payment_routes_1.default);
// 3. Express Global Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("combined"));
app.use(rateLimit_middleware_1.globalRateLimiter);
// 4. API Routes
app.use("/auth", auth_routes_1.default);
app.use("/orders", orders_routes_1.default);
app.use("/chatbot", chatbot_routes_1.default);
// Basic Health Check Route
app.get("/", (req, res) => {
    res.send("Order System Backend is running");
});
// 5. Error Handler (Must be after routes)
app.use(error_handler_1.errorHandler);
