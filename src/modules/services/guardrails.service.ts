export class GuardrailService {
  // Disallowed content categories
  static bannedInputPatterns = [
    /hack|hacking|ddos|exploit/i,
    /bomb|weapon|kill|murder/i,
    /credit card|cvv|ssn|password/i,
    /child\s*(?:porn|abuse)/i,
  ];

  // Sanitizes the reply if it violates output rules
  static sanitizeOutput(text: string): string {
    if (!text) return "I’m sorry, I couldn’t generate a response.";

    // Block unsafe LLM output
    const bannedOutput = /(kill|harm|illegal|suicide|violence)/i;
    if (bannedOutput.test(text)) {
      return "I'm here to help, but I can't assist with that topic.";
    }

    return text;
  }

  static validateInput(userMessage: string) {
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error("Invalid request: message is empty");
    }

    for (const pattern of this.bannedInputPatterns) {
      if (pattern.test(userMessage)) {
        throw new Error(
          "Your request contains restricted content and cannot be processed."
        );
      }
    }
  }
}
