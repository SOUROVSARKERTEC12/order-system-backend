import { z } from 'zod';
import { Role } from '../enums/user.enums';

// ----------------------------
// Reusable Validators (DRY)
// ----------------------------
export const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

// Generic fields
const emailField = z
  .string()
  .email()
  .regex(emailRegex, 'Invalid email format');

const passwordField = z
  .string()
  .min(6)
  .regex(
    passwordRegex,
    'Password must contain uppercase, lowercase, number & special character'
  );

// ----------------------------
// Register Schema
// ----------------------------
export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  role: z.enum(Object.values(Role)),
});

// ----------------------------
// Login Schema
// ----------------------------
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

// ----------------------------
// Types
// ----------------------------
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
