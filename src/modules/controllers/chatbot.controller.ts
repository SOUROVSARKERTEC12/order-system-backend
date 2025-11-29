// src/modules/controllers/chatbot.controller.ts
import { Request, Response, NextFunction } from "express";
import { ChatService } from "../services/chatbot.service";
import { CacheService } from "../../utils/cache.server";
import { z } from "zod";

const chatService = new ChatService();

const chatSchema = z.object({
  message: z.string().min(1),
});

// POST /chat
export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = chatSchema.parse(req.body);

    // Determine user key: logged-in user or guest by IP
    const userKey = (req as any).user?.id
      ? `user:${(req as any).user.id}`
      : `guest:${req.ip}`;

    // Get AI response and save history internally
    const reply = await chatService.getResponse(userKey, message);

    res.status(200).json({ reply });
  } catch (err) {
    next(err);
  }
};

// GET /history
export const history = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    console.log("Calll ..............0")
    const user = (req as any).user;

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }


    console.log("Calll ..............1")
    // Get global chat history
    const history = await CacheService.getChatHistory();

    res.status(200).json({ history });
  } catch (err) {
    next(err);
  }
};
