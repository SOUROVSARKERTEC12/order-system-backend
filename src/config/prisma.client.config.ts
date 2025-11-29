// src/config/prisma.client.config.ts (or wherever you have it)

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/prisma/client/client';  // ← Point to the new generated path

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(() => console.error('Database connection failed'));