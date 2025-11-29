"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const getRedisConfig = () => {
    if (!process.env.REDIS_HOST) {
        console.warn("⚠️ REDIS_HOST not defined, using fallback (localhost)");
    }
    return {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
        maxRetriesPerRequest: null,
        lazyConnect: true, // Important for serverless
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        },
    };
};
const redis = new ioredis_1.default(getRedisConfig());
redis.on("connect", () => {
    console.log("✅ Redis connected");
});
redis.on("error", (err) => {
    // Suppress error logs in Vercel if it's just connection failure
    if (process.env.VERCEL) {
        console.warn("⚠️ Redis connection failed (expected in Vercel)");
    }
    else {
        console.error("❌ Redis connection error:", err);
    }
});
exports.default = redis;
