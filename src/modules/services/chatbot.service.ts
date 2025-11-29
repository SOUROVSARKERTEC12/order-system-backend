// src/modules/services/chatbot.service.ts
import axios from "axios";
import { AppError } from "../../utils/error.handler";
import { CacheService } from "../../utils/cache.server";

export class ChatService {
  private readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";
  private readonly API_KEY = process.env.OPEN_ROUTER_KEY;

  /**
   * Get AI response and save chat history
   * @param userKey user id or guest id
   * @param message user message
   */
  async getResponse(userKey: string, message: string) {
    if (!this.API_KEY) {
      throw new AppError("Chatbot service unavailable", 503);
    }

    try {
      const response = await axios.post(
        this.API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const reply =
        response.data?.choices?.[0]?.message?.content ||
        "I'm sorry, I couldn't understand that.";

      // Save chat history for user
      await CacheService.saveChatHistory({
        userKey,
        question: message,
        answer: reply,
        timestamp: new Date().toISOString(),
      });

      return reply;
    } catch (err: any) {
      console.error("OpenRouter API Error:", err.response?.data || err.message);
      throw new AppError("Failed to get response from chatbot", 500);
    }
  }

  /**
   * Get last 10 global chat messages
   */
  async getHistory() {
    return CacheService.getChatHistory(); // no key needed, global
  }

  /**
   * Optional: get per-user chat (if you want)
   */
  async getUserHistory(userKey: string) {
    const all = await CacheService.getChatHistory();
    // Filter only for this user
    return all.filter((item) => item.userKey === userKey);
  }
}
