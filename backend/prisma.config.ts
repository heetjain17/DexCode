/// <reference types="node" />

import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: './.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

if (!process.env.DIRECT_URL) {
  throw new Error('Missing DIRECT_URL');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
