import { emailQueue } from "../../queues/email.queue";

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  delayMs?: number; // optional delay in milliseconds
}

export class EmailService {
  static async sendEmail(payload: SendEmailPayload) {
    const { to, subject, html, delayMs } = payload;

    await emailQueue.add(
      "send-email",
      { to, subject, html },
      {
        delay: delayMs || 0,
        attempts: 3, // retry up to 3 times
      }
    );

    console.log(`📝 Email job queued for ${to}`);
  }
}
