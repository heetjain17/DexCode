import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import executionRoutes from './routes/executeCode.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import { db } from './libs/db.ts';

import type { Request, Response, NextFunction } from 'express';

dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: `DexCode is running 🔪🩸`,
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problem', problemRoutes);
app.use('/api/v1/execute-code', executionRoutes);
app.use('/api/v1/submission', submissionRoutes);
app.use('/api/v1/playlist', playlistRoutes);

// Global error handler middleware
interface CustomError extends Error {
  statusCode?: number;
  errors?: unknown[];
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

async function startServer() {
  try {
    await db.$connect();
    console.log('✅ Database connected');
    app.listen(PORT, () => {
      console.log(`Server is up & running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
