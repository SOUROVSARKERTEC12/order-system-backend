"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
// src/modules/services/chatbot.service.ts
const axios_1 = __importDefault(require("axios"));
const error_handler_1 = require("../../utils/error.handler");
const cache_server_1 = require("../../utils/cache.server");
class ChatService {
    constructor() {
        this.API_URL = "https://openrouter.ai/api/v1/chat/completions";
        this.API_KEY = process.env.OPEN_ROUTER_KEY;
    }
    /**
     * Get AI response and save chat history
     * @param userKey user id or guest id
     * @param message user message
     */
    async getResponse(userKey, message) {
        if (!this.API_KEY) {
            throw new error_handler_1.AppError("Chatbot service unavailable", 503);
        }
        try {
            const response = await axios_1.default.post(this.API_URL, {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
                temperature: 0.7,
                max_tokens: 200,
            }, {
                headers: {
                    Authorization: `Bearer ${this.API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            const reply = response.data?.choices?.[0]?.message?.content ||
                "I'm sorry, I couldn't understand that.";
            // Save chat history for user
            await cache_server_1.CacheService.saveChatHistory({
                userKey,
                question: message,
                answer: reply,
                timestamp: new Date().toISOString(),
            });
            return reply;
        }
        catch (err) {
            console.error("OpenRouter API Error:", err.response?.data || err.message);
            throw new error_handler_1.AppError("Failed to get response from chatbot", 500);
        }
    }
    /**
     * Get last 10 global chat messages
     */
    async getHistory() {
        return cache_server_1.CacheService.getChatHistory(); // no key needed, global
    }
    /**
     * Optional: get per-user chat (if you want)
     */
    async getUserHistory(userKey) {
        const all = await cache_server_1.CacheService.getChatHistory();
        // Filter only for this user
        return all.filter((item) => item.userKey === userKey);
    }
}
exports.ChatService = ChatService;
