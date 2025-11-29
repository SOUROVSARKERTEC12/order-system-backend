import { Router } from "express";
import * as chatController from "../modules/controllers/chatbot.controller";
import { authorize } from "../middlewares/role.gurad.middleware";
import { Role } from "../enums/user.enums";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", chatController.chat);
router.use(authenticate);
router.get("/history", authorize(Role.ADMIN), chatController.history);

export default router;
