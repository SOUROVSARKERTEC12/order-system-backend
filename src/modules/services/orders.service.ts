import prisma from "../../config/prisma.client.config";
import { CreateOrderInput } from "../../schemas/orders.schema";
import { SocketService } from "../../socket/socket.service";
import { OrderStatus } from "../../enums/order.enums";
import { AppError } from "../../utils/error.handler";
import {
  PaymentFlow,
  PaymentMethod,
  PaymentStatus,
} from "../../enums/payment.enum";
import { PaymentService } from "./payment.service";
import { PaginationOptions } from "../../interfaces/pagination.interface";
import { CacheService } from "../../utils/cache.server";

export class OrderService {
  constructor(private paymentService: PaymentService) {}
  /**
   * Calculate total amount
   */
  private calculateTotal(items: CreateOrderInput["items"]): number {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  private async buildPaymentPayload(
    method: PaymentMethod,
    amount: number,
    orderId: string,
    flow: PaymentFlow
  ) {
    switch (method) {
      case PaymentMethod.Stripe:
        if (flow === PaymentFlow.FRONTEND) {
          // Return clientSecret for frontend to confirm
          const clientSecret =
            await this.paymentService.createStripePaymentIntent(
              amount,
              orderId
            );
          return { clientSecret };
        } else {
          // Backend-initiated payment
          const paymentReceipt =
            await this.paymentService.payStripePaymentIntent(amount, orderId);
          return { paymentReceipt };
        }

      case PaymentMethod.Paypal:
        // PayPal always requires client approval
        const approvalUrl = await this.paymentService.createPaypalOrder(
          amount,
          orderId
        );
        return { approvalUrl };

      default:
        throw new AppError("Unsupported payment method", 400);
    }
  }

  /**
   * Create Order
   */
  async createOrder(userId: string, data: CreateOrderInput) {
    if (!data.items.length) {
      throw new AppError("Order must contain at least one item", 400);
    }

    const totalAmount = this.calculateTotal(data.items);

    const order = await prisma.order.create({
      data: {
        userId,
        items: data.items,
        totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.Pending,
        orderStatus: OrderStatus.Pending,
      },
    });

    // Invalidate cached list
    await CacheService.del(`orders:${userId}`);

    const paymentDetails = await this.buildPaymentPayload(
      data.paymentMethod,
      totalAmount,
      order.id,
      data.paymentFlow
    );

    return { order, paymentDetails };
  }

  /**
   * Get Orders for a Specific User
   */
  async getOrdersWithCount(userId: string, options: PaginationOptions = {}) {
    const cacheKey = `orders:${userId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      console.log("Get From Cache")
      return cached;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: options.skip,
        take: options.take,
      }),
      prisma.order.count({
        where: { userId },
      }),
    ]);

    const result = [orders, total] as const;

    // Cache for 10 mins
    await CacheService.set(cacheKey, result, 600);

    return result;
  }

  /**
   * Update Order Status + Emit Live Event
   */
  async updateOrderStatus(orderId: string, orderStatus: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus, // correctly assign here
      },
    });

    // Invalidate cache
    await CacheService.del(`orders:${order.userId}`);

    SocketService.getInstance().emitOrderUpdate(
      updatedOrder.userId,
      updatedOrder.id,
      updatedOrder.orderStatus
    );

    return updatedOrder;
  }
}
