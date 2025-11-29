import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/error.handler";
import {
  LoginResponse,
  RegisterResponse,
} from "../../interfaces/user.interface";
import { Role } from "../../enums/user.enums";
import { LoginInput, RegisterInput } from "../../schemas/user.schema";
import { prisma } from "../../config/prisma.client.config";

export class AuthService {
  // -----------------------------
  // Utility: Hash Password
  // -----------------------------
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // -----------------------------
  // Utility: Compare Password
  // -----------------------------
  private async verifyPassword(
    password: string,
    hashed: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  // -----------------------------
  // Utility: Generate JWT Token
  // -----------------------------
  private generateToken(userId: string, role: Role): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured");

    return jwt.sign({ userId, role }, secret, { expiresIn: "1d" });
  }

  // --------------------------------
  // REGISTER USER
  // --------------------------------
  async register(payload: RegisterInput): Promise<RegisterResponse> {
    const { email, password, role } = payload;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError("User already exists", 400);

    const hashedPassword = await this.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
    };
  }

  // --------------------------------
  // LOGIN USER
  // --------------------------------
  async login(payload: LoginInput): Promise<LoginResponse> {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) throw new AppError("Invalid credentials", 401);

    const token = this.generateToken(user.id, user.role as Role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
      },
    };
  }
}
