"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrders = exports.createOrder = void 0;
const orders_service_1 = require("../services/orders.service");
const orders_schema_1 = require("../../schemas/orders.schema");
const payment_service_1 = require("../services/payment.service");
const orderService = new orders_service_1.OrderService(new payment_service_1.PaymentService());
const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const data = orders_schema_1.createOrderSchema.parse(req.body);
        const result = await orderService.createOrder(userId, data);
        res.status(201).json({ status: "success", data: result });
        await orderService.orderEmail(result.order.id);
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const parsed = orders_schema_1.updateOrderStatusSchema.parse(req.body);
        const order = await orderService.updateOrderStatus(id, parsed.orderStatus);
        return res.status(200).json({
            status: "success",
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
