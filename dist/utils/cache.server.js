"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
// src/utils/cache.server.ts
const redis_config_1 = __importDefault(require("../config/redis.config"));
class CacheService {
    /**
     * Get cached value by key
     */
    static async get(key) {
        const data = await redis_config_1.default.get(key);
        return data ? JSON.parse(data) : null;
    }
    /**
     * Set cached value with TTL in seconds (default 60s)
     */
    static async set(key, value, ttlSeconds = 60) {
        await redis_config_1.default.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }
    /**
     * Delete cached key
     */
    static async del(key) {
        await redis_config_1.default.del(key);
    }
    /**
     * Save a chat message globally
     */
    static async saveChatHistory(entry) {
        if (!entry)
            return;
        await redis_config_1.default.lpush(this.GLOBAL_CHAT_KEY, JSON.stringify(entry));
        await redis_config_1.default.ltrim(this.GLOBAL_CHAT_KEY, 0, 99); // Keep last 100 messages globally
    }
    /**
     * Get last N chat messages for all users
     */
    static async getChatHistory(limit = 100) {
        console.log("calll.............2");
        const items = await redis_config_1.default.lrange(this.GLOBAL_CHAT_KEY, 0, limit - 1);
        if (!items || items.length === 0) {
            console.log("calll.............3");
            return [];
        }
        return items.map((i) => JSON.parse(i));
    }
}
exports.CacheService = CacheService;
CacheService.GLOBAL_CHAT_KEY = "chat_history_all_users";
