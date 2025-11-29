"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paypalWebhook = exports.stripeWebhook = void 0;
const payment_service_1 = require("../services/payment.service");
const error_handler_1 = require("../../utils/error.handler");
const paymentService = new payment_service_1.PaymentService();
/**
 * Stripe Webhook Handler
 * Note: req.body must be raw (Buffer) for signature verification
 */
const stripeWebhook = async (req, res, next) => {
    try {
        const signature = req.headers["stripe-signature"];
        if (!signature)
            throw new error_handler_1.AppError("Stripe signature missing", 400);
        const payload = req.body;
        await paymentService.handleStripeWebhook(signature, payload);
        res.status(200).json({ status: "success", received: true });
    }
    catch (error) {
        next(error);
    }
};
exports.stripeWebhook = stripeWebhook;
/**
 * PayPal Webhook Handler
 */
const paypalWebhook = async (req, res, next) => {
    try {
        if (!req.body)
            throw new error_handler_1.AppError("Invalid payload", 400);
        await paymentService.handlePaypalWebhook(req.body);
        res.status(200).json({ status: "success", received: true });
    }
    catch (error) {
        next(error);
    }
};
exports.paypalWebhook = paypalWebhook;
