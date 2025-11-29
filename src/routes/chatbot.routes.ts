import { Router } from "express";
import * as chatController from "../modules/controllers/chatbot.controller";
import { authorize } from "../middlewares/role.gurad.middleware";
import { Role } from "../enums/user.enums";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /chatbot:
 *   post:
 *     summary: Chat with the AI chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Chat response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post("/", chatController.chat);
router.use(authenticate);
/**
 * @swagger
 * /chatbot/history:
 *   get:
 *     summary: Get chat history (Admin only)
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/history", authorize(Role.ADMIN), chatController.history);

export default router;
