"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_config_1 = __importDefault(require("../config/redis.config"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_queue_1 = require("./email.queue");
const worker = new bullmq_1.Worker(email_queue_1.emailQueueName, async (job) => {
    const { to, subject, html } = job.data;
    // Gmail transporter
    const transporter = nodemailer_1.default.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // Gmail with port 587 is not secure
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: `OpenRouter Team <process.env.SMTP_MAIL>`,
        to,
        subject,
        html,
    });
    console.log(`📧 Email sent to ${to}`);
}, { connection: redis_config_1.default });
worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
});
exports.default = worker;
