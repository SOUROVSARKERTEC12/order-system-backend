import { Request, Response, NextFunction } from "express";
import { Role } from "../enums/user.enums";
import { AppError } from "../utils/error.handler";

/**
 * Reusable role-based guard middleware
 */
export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(
        new AppError("You are not authorized to access this resource", 403)
      );
    }

    // console.log(req.user);
    return next();
  };
