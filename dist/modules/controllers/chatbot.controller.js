"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.history = exports.chat = void 0;
const chatbot_service_1 = require("../services/chatbot.service");
const cache_server_1 = require("../../utils/cache.server");
const zod_1 = require("zod");
const chatService = new chatbot_service_1.ChatService();
const chatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1),
});
// POST /chat
const chat = async (req, res, next) => {
    try {
        const { message } = chatSchema.parse(req.body);
        // Determine user key: logged-in user or guest by IP
        const userKey = req.user?.id
            ? `user:${req.user.id}`
            : `guest:${req.ip}`;
        // Get AI response and save history internally
        const reply = await chatService.getResponse(userKey, message);
        res.status(200).json({ reply });
    }
    catch (err) {
        next(err);
    }
};
exports.chat = chat;
// GET /history
const history = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }
        // Get global chat history
        const history = await cache_server_1.CacheService.getChatHistory();
        res.status(200).json({ history });
    }
    catch (err) {
        next(err);
    }
};
exports.history = history;
