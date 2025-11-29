import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("Database connect successfully"))
  .catch((e) => console.error("Database connection failed", e));

export default prisma;
