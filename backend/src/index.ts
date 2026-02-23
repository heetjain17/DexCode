import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { sql } from 'drizzle-orm';

import authRoutes from './routes/auth.routes';
import problemRoutes from './routes/problem.routes';
import executionRoutes from './routes/executeCode.routes';
// import submissionRoutes from './routes/submission.routes';
// import playlistRoutes from './routes/playlist.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { db } from './libs/db';

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
// app.use('/api/v1/submission', submissionRoutes);
// app.use('/api/v1/playlist', playlistRoutes);

// Global error handler middleware
app.use(errorMiddleware);

async function checkDbConnection(): Promise<void> {
  const result = await db.execute(sql`SELECT current_database() AS db, now() AS time`);
  const row = result.rows[0] as { db: string; time: string };
  console.log(`Database connected — db: "${row.db}", server time: ${row.time}`);
}

async function startServer() {
  try {
    await checkDbConnection();
    app.listen(PORT, () => {
      console.log(`Server is up & running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
