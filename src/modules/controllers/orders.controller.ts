import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/orders.service";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../../schemas/orders.schema";
import { PaymentService } from "../services/payment.service";

const orderService = new OrderService(new PaymentService());

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const data = createOrderSchema.parse(req.body);
    const result = await orderService.createOrder(userId, data);
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get orders + total count
    const [orders, total] = await orderService.getOrdersWithCount(userId, {
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: "success",
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const parsed = updateOrderStatusSchema.parse(req.body);

    const order = await orderService.updateOrderStatus(id, parsed.orderStatus);

    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
