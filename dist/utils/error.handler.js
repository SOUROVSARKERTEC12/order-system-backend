"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    console.error(err);
    // Custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }
    // Zod validation error
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        }));
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: formattedErrors,
        });
    }
    // Unknown server error
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
