import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { AppError } from "../../utils/error.handler";

const paymentService = new PaymentService();

/**
 * Stripe Webhook Handler
 * Note: req.body must be raw (Buffer) for signature verification
 */
export const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) throw new AppError("Stripe signature missing", 400);
    const payload = req.body;
    await paymentService.handleStripeWebhook(signature, payload);

    res.status(200).json({ status: "success", received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * PayPal Webhook Handler
 */
export const paypalWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body) throw new AppError("Invalid payload", 400);

    await paymentService.handlePaypalWebhook(req.body);

    res.status(200).json({ status: "success", received: true });
  } catch (error) {
    next(error);
  }
};
