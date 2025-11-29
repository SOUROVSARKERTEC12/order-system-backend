"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = exports.emailQueueName = void 0;
// src/queues/email.queue.ts
const bullmq_1 = require("bullmq");
const redis_config_1 = __importDefault(require("../config/redis.config"));
// Use your ioredis instance as connection
const connection = redis_config_1.default;
exports.emailQueueName = "email-queue";
exports.emailQueue = new bullmq_1.Queue(exports.emailQueueName, {
    connection,
});
