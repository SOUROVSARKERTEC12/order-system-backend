import Stripe from "stripe";
import axios from "axios";
import prisma from "../../config/prisma.client.config";
import { AppError } from "../../utils/error.handler";
import { SocketService } from "../../socket/socket.service";
import { PaymentStatus } from "../../enums/payment.enum";
import { OrderStatus } from "../../enums/order.enums";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export class PaymentService {
  /* -------------------------------------------------------------------------- */
  /*                           STRIPE PAYMENT INTENT                            */
  /* -------------------------------------------------------------------------- */

  /**
   * Create Stripe PaymentIntent for frontend use
   */
  async createStripePaymentIntent(amount: number, orderId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: this.toCents(amount),
        currency: "usd",
        metadata: { orderId },
        automatic_payment_methods: { enabled: true },
      });

      if (!paymentIntent.client_secret) {
        throw new AppError("Failed to generate Stripe client secret", 500);
      }

      return paymentIntent.client_secret;
    } catch (error) {
      console.error("Stripe PaymentIntent Error:", error);
      throw new AppError("Stripe payment initialization failed", 500);
    }
  }

  /**
   * Backend-initiated payment using test card (server-side)
   */
  async payStripePaymentIntent(amount: number, orderId: string) {
    try {
      // 1️⃣ Create AND confirm PaymentIntent at the same time
      const paymentIntent = await stripe.paymentIntents.create({
        amount: this.toCents(amount),
        currency: "usd",
        metadata: { orderId },
        payment_method_types: ["card"],
        payment_method: "pm_card_visa", // optional if confirming immediately
        confirm: true, // this confirms the PaymentIntent immediately
      });

      // 2️⃣ Check status
      // console.log("call........................... 1");
      if (paymentIntent.status !== "succeeded") {
        console.log("call........................... 2");
        await this.updateOrderStatus(
          orderId,
          PaymentStatus.Failed,
          OrderStatus.Cancelled
        );
        throw new AppError("Stripe payment failed", 400);
      }

      // console.log("call........................... 3");
      // 3️⃣ Mark order paid
      await this.updateOrderStatus(
        orderId,
        PaymentStatus.Paid,
        OrderStatus.Processing
      );

      return {
        paymentIntentId: paymentIntent.id,
        amount: amount,
        status: paymentIntent.status,
      };
    } catch (err) {
      // Handle errors like card declines
      await this.updateOrderStatus(
        orderId,
        PaymentStatus.Failed,
        OrderStatus.Cancelled
      );
      throw new AppError("Stripe payment error", 400);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                PAYPAL ORDER                                */
  /* -------------------------------------------------------------------------- */

  async createPaypalOrder(amount: number, orderId: string) {
    try {
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString("base64");

      const response = await axios.post(
        "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: orderId,
              amount: {
                currency_code: "USD",
                value: amount.toFixed(2),
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      const approvalUrl = response.data.links.find(
        (l: any) => l.rel === "approve"
      )?.href;
      if (!approvalUrl)
        throw new AppError("Unable to fetch PayPal approval URL", 500);

      return approvalUrl;
    } catch (error) {
      console.error("PayPal Order Error:", error);
      throw new AppError("PayPal payment initialization failed", 500);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             STRIPE WEBHOOK HANDLER                         */
  /* -------------------------------------------------------------------------- */

  async handleStripeWebhook(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      throw new AppError(
        `Stripe Webhook Error: ${(err as Error).message}`,
        400
      );
    }

    const intent = event.data.object as Stripe.PaymentIntent | undefined;

    switch (event.type) {
      case "payment_intent.succeeded":
        if (intent)
          await this.updateOrderStatus(
            intent.metadata?.orderId,
            PaymentStatus.Paid,
            OrderStatus.Processing
          );
        break;

      case "payment_intent.payment_failed":
        if (intent)
          await this.updateOrderStatus(
            intent.metadata?.orderId,
            PaymentStatus.Failed,
            OrderStatus.Cancelled
          );
        break;

      default:
        console.log(`Unhandled Stripe webhook event: ${event.type}`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             PAYPAL WEBHOOK HANDLER                         */
  /* -------------------------------------------------------------------------- */

  async handlePaypalWebhook(body: any) {
    const eventType = body.event_type;
    const resource = body.resource;

    if (!resource) return;

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const orderId =
          resource.purchase_units?.[0]?.reference_id || resource.custom_id;
        await this.updateOrderStatus(
          orderId,
          PaymentStatus.Paid,
          OrderStatus.Processing
        );
        break;
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED": {
        const orderId =
          resource.purchase_units?.[0]?.reference_id || resource.custom_id;
        await this.updateOrderStatus(
          orderId,
          PaymentStatus.Failed,
          OrderStatus.Cancelled
        );
        break;
      }

      default:
        console.log(`Unhandled PayPal webhook: ${eventType}`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             INTERNAL UTILITIES                             */
  /* -------------------------------------------------------------------------- */

  /**
   * Unified order status updater
   */
  private async updateOrderStatus(
    orderId?: string,
    paymentStatus?: PaymentStatus,
    orderStatus?: OrderStatus
  ) {
    if (!orderId) return;

    // 1️⃣ Fetch the current order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    // 2️⃣ Check if any update is needed
    const needsUpdate =
      (paymentStatus && order.paymentStatus !== paymentStatus) ||
      (orderStatus && order.orderStatus !== orderStatus);

    if (!needsUpdate) {
      console.log(
        `✅ Order ${orderId} already has the desired status. No update needed.`
      );
      return order; // nothing changed
    }

    // 3️⃣ Update only changed fields
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(paymentStatus && { paymentStatus }),
        ...(orderStatus && { orderStatus }),
      },
    });

    // 4️⃣ Emit socket event to user
    SocketService.getInstance().emitOrderUpdate(
      updatedOrder.userId,
      updatedOrder.id,
      updatedOrder.orderStatus
    );

    return updatedOrder;
  }

  /**
   * Convert USD to cents
   */
  private toCents(amount: number): number {
    return Math.round(amount * 100);
  }
}
