"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const prisma_client_config_1 = __importDefault(require("../../config/prisma.client.config"));
const socket_service_1 = require("../../socket/socket.service");
const order_enums_1 = require("../../enums/order.enums");
const error_handler_1 = require("../../utils/error.handler");
const payment_enum_1 = require("../../enums/payment.enum");
const cache_server_1 = require("../../utils/cache.server");
const email_service_1 = require("./email.service");
class OrderService {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    /**
     * Calculate total amount
     */
    calculateTotal(items) {
        return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
    async buildPaymentPayload(method, amount, orderId, flow) {
        switch (method) {
            case payment_enum_1.PaymentMethod.Stripe:
                if (flow === payment_enum_1.PaymentFlow.FRONTEND) {
                    // Return clientSecret for frontend to confirm
                    const clientSecret = await this.paymentService.createStripePaymentIntent(amount, orderId);
                    return { clientSecret };
                }
                else {
                    // Backend-initiated payment
                    const paymentReceipt = await this.paymentService.payStripePaymentIntent(amount, orderId);
                    return { paymentReceipt };
                }
            case payment_enum_1.PaymentMethod.Paypal:
                // PayPal always requires client approval
                const approvalUrl = await this.paymentService.createPaypalOrder(amount, orderId);
                return { approvalUrl };
            default:
                throw new error_handler_1.AppError("Unsupported payment method", 400);
        }
    }
    /**
     * Create Order
     */
    async createOrder(userId, data) {
        if (!data.items.length) {
            throw new error_handler_1.AppError("Order must contain at least one item", 400);
        }
        const totalAmount = this.calculateTotal(data.items);
        const order = await prisma_client_config_1.default.order.create({
            data: {
                userId,
                items: data.items,
                totalAmount,
                paymentMethod: data.paymentMethod,
                paymentStatus: payment_enum_1.PaymentStatus.Pending,
                orderStatus: order_enums_1.OrderStatus.Pending,
            },
        });
        // Invalidate cached list
        await cache_server_1.CacheService.del(`orders:${userId}`);
        const paymentDetails = await this.buildPaymentPayload(data.paymentMethod, totalAmount, order.id, data.paymentFlow);
        if (data.paymentFlow == payment_enum_1.PaymentFlow.BACKEND) {
            order.paymentStatus = payment_enum_1.PaymentStatus.Paid;
            order.orderStatus = order_enums_1.OrderStatus.Processing;
        }
        return { order, paymentDetails };
    }
    /**
     * Get Orders for a Specific User
     */
    async getOrdersWithCount(userId, options = {}) {
        const cacheKey = `orders:${userId}`;
        const cached = await cache_server_1.CacheService.get(cacheKey);
        if (cached) {
            console.log("Get From Cache");
            return cached;
        }
        const [orders, total] = await Promise.all([
            prisma_client_config_1.default.order.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip: options.skip,
                take: options.take,
            }),
            prisma_client_config_1.default.order.count({
                where: { userId },
            }),
        ]);
        const result = [orders, total];
        // Cache for 10 mins
        await cache_server_1.CacheService.set(cacheKey, result, 600);
        return result;
    }
    /**
     * Update Order Status + Emit Live Event
     */
    async updateOrderStatus(orderId, orderStatus) {
        const order = await prisma_client_config_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new error_handler_1.AppError("Order not found", 404);
        }
        const updatedOrder = await prisma_client_config_1.default.order.update({
            where: { id: orderId },
            data: {
                orderStatus, // correctly assign here
            },
        });
        // Invalidate cache
        await cache_server_1.CacheService.del(`orders:${order.userId}`);
        socket_service_1.SocketService.getInstance().emitOrderUpdate(updatedOrder.userId, updatedOrder.id, updatedOrder.orderStatus);
        return updatedOrder;
    }
    /**
     * Send order email to user
     */
    async orderEmail(orderId) {
        // 1️⃣ Get order with user info
        const order = await prisma_client_config_1.default.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new error_handler_1.AppError("Order not found", 404);
        }
        const userEmail = order.user?.email;
        if (!userEmail) {
            throw new error_handler_1.AppError("User email not found", 400);
        }
        // 2️⃣ Cast items JSON safely
        const items = order.items ??
            [];
        const itemsHtml = items.length
            ? items
                .map((item) => `<li>${item.title} x ${item.quantity} - $${item.price}</li>`)
                .join("")
            : "<li>No items found in this order.</li>";
        const html = `
    <h2>Hi ${order.user?.email}</h2>
    <p>Thank you for your order. Here are your order details:</p>
    <ul>
      ${itemsHtml}
    </ul>
    <p>Total Amount: $${order.totalAmount}</p>
    <p>Payment Status: ${order.paymentStatus}</p>
    <p>Order Status: ${order.orderStatus}</p>
  `;
        // 3️⃣ Send email
        await email_service_1.EmailService.sendEmail({
            to: userEmail,
            subject: `Your Order #${order.id} is ${order.orderStatus}`,
            html,
        });
        return { success: true, message: `Email sent to ${userEmail}` };
    }
}
exports.OrderService = OrderService;
