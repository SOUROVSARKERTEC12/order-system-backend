import { Worker, Job } from "bullmq";
import redis from "../config/redis.config";
import nodemailer from "nodemailer";
import { emailQueueName } from "./email.queue";

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

const worker = new Worker<EmailJobData>(
  emailQueueName,
  async (job: Job<EmailJobData>) => {
    const { to, subject, html } = job.data;

    // Gmail transporter
    const transporter = nodemailer.createTransport({
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
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

export default worker;
