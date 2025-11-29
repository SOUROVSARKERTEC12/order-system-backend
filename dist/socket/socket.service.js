"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
// src/socket/socket.service.ts
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handler_1 = require("../utils/error.handler");
class SocketService {
    constructor() {
        this.io = null;
    }
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    init(server) {
        if (this.io)
            return this.io; // Prevent double initialization
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.NODE_ENV === "production"
                    ? process.env.CLIENT_URL || "https://your-production-url.com"
                    : "*",
                methods: ["GET", "POST", "PATCH"],
            },
        });
        // JWT Auth middleware
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token)
                return next(new error_handler_1.AppError("Authentication token required", 401));
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                if (!payload.userId)
                    return next(new error_handler_1.AppError("User ID required in token", 401));
                socket.user = payload;
                next();
            }
            catch (err) {
                next(new error_handler_1.AppError("Invalid token", 401));
            }
        });
        // Connection
        this.io.on("connection", (socket) => {
            const userId = socket.user?.userId || "unknown";
            console.log(`User connected: ${userId}`);
            socket.join(userId);
            socket.on("disconnect", () => {
                console.log(`User disconnected: ${userId}`);
            });
        });
        return this.io;
    }
    getIo() {
        if (!this.io)
            throw new Error("Socket.IO not initialized");
        return this.io;
    }
    emitOrderUpdate(userId, orderId, status) {
        if (!this.io) {
            console.warn("⚠️ Socket.IO not initialized, skipping order update emit.");
            return;
        }
        this.getIo().to(userId).emit("orderUpdate", { userId, orderId, status });
    }
}
exports.SocketService = SocketService;
