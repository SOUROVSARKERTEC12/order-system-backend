"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const payment_enum_1 = require("../enums/payment.enum");
const order_enums_1 = require("../enums/order.enums");
// ---------------------------------------------------
// Reusable Order Item Schema
// ---------------------------------------------------
const orderItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Item title is required'),
    price: zod_1.z
        .number()
        .positive('Price must be greater than 0')
        .refine((v) => Number.isFinite(v), {
        message: 'Invalid numeric value provided',
    }),
    quantity: zod_1.z
        .number()
        .int('Quantity must be an integer')
        .positive('Quantity must be greater than 0'),
});
// ---------------------------------------------------
// Create Order Schema
// ---------------------------------------------------
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z
        .array(orderItemSchema)
        .min(1, 'Order must contain at least one item'),
    paymentMethod: zod_1.z.enum(payment_enum_1.PaymentMethod),
    paymentFlow: zod_1.z.enum(payment_enum_1.PaymentFlow),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    orderStatus: zod_1.z.enum(order_enums_1.OrderStatus),
});
