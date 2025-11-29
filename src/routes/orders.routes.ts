import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import * as orderController from '../modules/controllers/orders.controller';
import { Role } from '../enums/user.enums';
import { authorize } from '../middlewares/role.gurad.middleware';

const router = Router();

// -------------------------------
// Protected Routes
// -------------------------------

router.use(authenticate);

// Create Order
router.post('/', orderController.createOrder);

// Get Orders
router.get('/', orderController.getOrders);

// Update Order Status (Admin Only)
router.patch(
  '/:id/status',
  authorize(Role.ADMIN),
  orderController.updateOrderStatus
);

export default router;
