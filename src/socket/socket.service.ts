// src/socket/socket.service.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.handler";
import * as http from "http";

interface JwtPayload {
  userId: string;
  role?: string;
}

interface ExtendedSocket extends Socket {
  user?: JwtPayload;
}

class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(server: http.Server): Server {
    if (this.io) return this.io; // Prevent double initialization

    this.io = new Server(server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.CLIENT_URL || "https://your-production-url.com"
            : "*",
        methods: ["GET", "POST", "PATCH"],
      },
    });

    // JWT Auth middleware
    this.io.use((socket: ExtendedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token)
        return next(new AppError("Authentication token required", 401));

      try {
        const payload = jwt.verify(
          token as string,
          process.env.JWT_SECRET!
        ) as JwtPayload;
        if (!payload.userId)
          return next(new AppError("User ID required in token", 401));
        socket.user = payload;
        next();
      } catch (err) {
        next(new AppError("Invalid token", 401));
      }
    });

    // Connection
    this.io.on("connection", (socket: ExtendedSocket) => {
      const userId = socket.user?.userId || "unknown";
      console.log(`User connected: ${userId}`);

      socket.join(userId);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId}`);
      });
    });

    return this.io;
  }

  public getIo(): Server {
    if (!this.io) throw new Error("Socket.IO not initialized");
    return this.io;
  }

  public emitOrderUpdate(userId: string, orderId: string, status: string) {
    this.getIo().to(userId).emit("orderUpdate", { userId, orderId, status });
  }
}

export { SocketService };
