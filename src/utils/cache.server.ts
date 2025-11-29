// src/utils/cache.server.ts
import redis from "../config/redis.config";

export class CacheService {
  private static GLOBAL_CHAT_KEY = "chat_history_all_users";
  /**
   * Get cached value by key
   */
  static async get<T = any>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /**
   * Set cached value with TTL in seconds (default 60s)
   */
  static async set(key: string, value: any, ttlSeconds = 60): Promise<void> {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  /**
   * Delete cached key
   */
  static async del(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * Save a chat message globally
   */
  static async saveChatHistory(entry: any): Promise<void> {
    if (!entry) return;
    await redis.lpush(this.GLOBAL_CHAT_KEY, JSON.stringify(entry));
    await redis.ltrim(this.GLOBAL_CHAT_KEY, 0, 99); // Keep last 100 messages globally
  }

  /**
   * Get last N chat messages for all users
   */
  static async getChatHistory<T = any>(limit = 100): Promise<T[]> {

    console.log("calll.............2")
    const items: string[] | null = await redis.lrange(
      this.GLOBAL_CHAT_KEY,
      0,
      limit - 1
    );

    if (!items || items.length === 0) {
        console.log("calll.............3")
      return [];
    }

    return items.map((i: string) => JSON.parse(i) as T);
  }
}
