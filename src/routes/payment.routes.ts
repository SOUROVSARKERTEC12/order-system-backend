import { Router } from 'express';
import express from 'express';
import * as paymentController from '../modules/controllers/payment.controller';

const router = Router();

// Stripe requires raw body for webhook verification
/**
 * @swagger
 * /payments/webhook/stripe:
 *   post:
 *     summary: Stripe webhook
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

/**
 * @swagger
 * /payments/webhook/paypal:
 *   post:
 *     summary: PayPal webhook
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/webhook/paypal', paymentController.paypalWebhook);

export default router;
