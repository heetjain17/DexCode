import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { sql } from 'drizzle-orm';

import { db } from './libs/db';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import executionRoutes from './routes/executeCode.routes';
import problemRoutes from './routes/problem.routes';
// import playlistRoutes from './routes/playlist.routes';
// import submissionRoutes from './routes/submission.routes';

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ statusCode: 200, message: 'DexCode is running 🔪🩸' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problem', problemRoutes);
app.use('/api/v1/execute-code', executionRoutes);
// app.use('/api/v1/submission', submissionRoutes);
// app.use('/api/v1/playlist', playlistRoutes);

// Error handling (must be last)
app.use(errorMiddleware);

/**
 * Verify database connectivity before starting the server.
 * Logs the connected database name and server timestamp.
 */
async function verifyDatabase(): Promise<void> {
  const result = await db.execute(sql`SELECT current_database() AS db, now() AS time`);
  const row = result.rows[0] as { db: string; time: string };
  console.log(`✓ Database connected — db: "${row.db}", server time: ${row.time}`);
}

/**
 * Initialize and start the Express server.
 * Performs database connectivity check before accepting requests.
 */
async function startServer(): Promise<void> {
  try {
    await verifyDatabase();
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
