"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
prisma.$connect()
    .then(() => console.log("Database connect successfully"))
    .catch((e) => console.error("Database connection failed", e));
exports.default = prisma;
