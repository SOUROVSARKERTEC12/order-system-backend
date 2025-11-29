// src/queues/email.queue.ts
import { Queue } from "bullmq";
import redis from "../config/redis.config";

// Use your ioredis instance as connection
const connection = redis;

export const emailQueueName = "email-queue";

export const emailQueue = new Queue(emailQueueName, {
  connection,
});
