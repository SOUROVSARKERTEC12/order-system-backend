"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = exports.passwordRegex = exports.emailRegex = void 0;
const zod_1 = require("zod");
const user_enums_1 = require("../enums/user.enums");
// ----------------------------
// Reusable Validators (DRY)
// ----------------------------
exports.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
exports.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
// Generic fields
const emailField = zod_1.z
    .string()
    .email()
    .regex(exports.emailRegex, 'Invalid email format');
const passwordField = zod_1.z
    .string()
    .min(6)
    .regex(exports.passwordRegex, 'Password must contain uppercase, lowercase, number & special character');
// ----------------------------
// Register Schema
// ----------------------------
exports.registerSchema = zod_1.z.object({
    email: emailField,
    password: passwordField,
    role: zod_1.z.enum(Object.values(user_enums_1.Role)),
});
// ----------------------------
// Login Schema
// ----------------------------
exports.loginSchema = zod_1.z.object({
    email: emailField,
    password: passwordField,
});
