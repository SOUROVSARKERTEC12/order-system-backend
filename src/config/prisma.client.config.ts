import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/client/client';

process.env.NODE_TLS_REJECT_UNAUTHORIZED;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);



export const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(() => console.error('Database connection failed'));