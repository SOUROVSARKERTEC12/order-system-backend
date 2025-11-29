import { Router } from 'express';
import express from 'express';
import * as paymentController from '../modules/controllers/payment.controller';

const router = Router();

// Stripe requires raw body for webhook verification
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

router.post('/webhook/paypal', paymentController.paypalWebhook);

export default router;
