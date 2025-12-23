import { PrismaClient } from '../generated/prisma/index.js';

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Function to check database connection
export async function checkConnection() {
  try {
    await db.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established.');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
  }
}

checkConnection();
