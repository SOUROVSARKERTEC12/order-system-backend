import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../../schemas/user.schema";
import { EmailService } from "../services/email.service";

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    res.status(201).json({ status: "success", data: user });

    const subject = "Welcome to Our Platform!";
    const html = `
          <h1>Welcome, ${data.email}!</h1>
          <p>Thank you for registering. We're excited to have you on board.</p>
        `;

    await EmailService.sendEmail({
      to: user.email,
      subject,
      html,
      delayMs: 0, // send immediately
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};
