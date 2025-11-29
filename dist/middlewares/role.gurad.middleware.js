"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const error_handler_1 = require("../utils/error.handler");
/**
 * Reusable role-based guard middleware
 */
const authorize = (...allowedRoles) => (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
        return next(new error_handler_1.AppError("You are not authorized to access this resource", 403));
    }
    // console.log(req.user);
    return next();
};
exports.authorize = authorize;
