import { z } from 'zod';
import { PaymentFlow, PaymentMethod } from '../enums/payment.enum';
import { OrderStatus } from '../enums/order.enums';

// ---------------------------------------------------
// Reusable Order Item Schema
// ---------------------------------------------------
const orderItemSchema = z.object({
  title: z.string().min(1, 'Item title is required'),

  price: z
    .number()
    .positive('Price must be greater than 0')
    .refine((v) => Number.isFinite(v), {
      message: 'Invalid numeric value provided',
    }),

  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
});

// ---------------------------------------------------
// Create Order Schema
// ---------------------------------------------------
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item'),

  paymentMethod: z.enum(PaymentMethod),
  paymentFlow: z.enum(PaymentFlow),
});

// ---------------------------------------------------
// Export Type
// ---------------------------------------------------
export type CreateOrderInput = z.infer<typeof createOrderSchema>;


export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(OrderStatus),
});

export type UpdateOrderStatusType = z.infer<typeof updateOrderStatusSchema>;