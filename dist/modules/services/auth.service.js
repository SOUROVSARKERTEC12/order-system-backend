"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_client_config_1 = require("../../config/prisma.client.config");
const error_handler_1 = require("../../utils/error.handler");
class AuthService {
    // -----------------------------
    // Utility: Hash Password
    // -----------------------------
    async hashPassword(password) {
        return bcrypt_1.default.hash(password, 10);
    }
    // -----------------------------
    // Utility: Compare Password
    // -----------------------------
    async verifyPassword(password, hashed) {
        return bcrypt_1.default.compare(password, hashed);
    }
    // -----------------------------
    // Utility: Generate JWT Token
    // -----------------------------
    generateToken(userId, role) {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET is not configured");
        return jsonwebtoken_1.default.sign({ userId, role }, secret, { expiresIn: "1d" });
    }
    // --------------------------------
    // REGISTER USER
    // --------------------------------
    async register(payload) {
        const { email, password, role } = payload;
        const existingUser = await prisma_client_config_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new error_handler_1.AppError("User already exists", 400);
        const hashedPassword = await this.hashPassword(password);
        const user = await prisma_client_config_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            },
        });
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
    // --------------------------------
    // LOGIN USER
    // --------------------------------
    async login(payload) {
        const { email, password } = payload;
        const user = await prisma_client_config_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new error_handler_1.AppError("Invalid credentials", 401);
        const isValidPassword = await this.verifyPassword(password, user.password);
        if (!isValidPassword)
            throw new error_handler_1.AppError("Invalid credentials", 401);
        const token = this.generateToken(user.id, user.role);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
}
exports.AuthService = AuthService;
