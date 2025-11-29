"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const email_queue_1 = require("../../queues/email.queue");
class EmailService {
    static async sendEmail(payload) {
        const { to, subject, html, delayMs } = payload;
        await email_queue_1.emailQueue.add("send-email", { to, subject, html }, {
            delay: delayMs || 0,
            attempts: 3, // retry up to 3 times
        });
        console.log(`📝 Email job queued for ${to}`);
    }
}
exports.EmailService = EmailService;
