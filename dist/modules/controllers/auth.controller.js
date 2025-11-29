"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const user_schema_1 = require("../../schemas/user.schema");
const email_service_1 = require("../services/email.service");
const authService = new auth_service_1.AuthService();
const register = async (req, res, next) => {
    try {
        const data = user_schema_1.registerSchema.parse(req.body);
        const user = await authService.register(data);
        res.status(201).json({ status: "success", data: user });
        const subject = "Welcome to Our Platform!";
        const html = `
          <h1>Welcome, ${data.email}!</h1>
          <p>Thank you for registering. We're excited to have you on board.</p>
        `;
        await email_service_1.EmailService.sendEmail({
            to: user.email,
            subject,
            html,
            delayMs: 0, // send immediately
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const data = user_schema_1.loginSchema.parse(req.body);
        const result = await authService.login(data);
        res.status(200).json({ status: "success", data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
