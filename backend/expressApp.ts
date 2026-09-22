import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notesRouter from './routes/notesRouter.js';
import logger from './middlewares/logger.js';
import usersRouter from './routes/usersRouter.js';
import aiRouter from './routes/aiRouter.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors({ exposedHeaders: ['X-Total-Count'] }));
app.use(express.json());
app.use(logger);

// Health check
app.get('/health', (req, res) => res.send('OK'));

app.use('/notes', notesRouter);
app.use('/', usersRouter);
app.use('/ai', aiRouter);

// Error handler - must be last
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('UNHANDLED ERROR:', err);   // ← prints the real error + stack
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

export default app;