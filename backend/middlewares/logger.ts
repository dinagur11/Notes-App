import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, '../log.txt');

const logger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${req.method} ${req.path} ${JSON.stringify(req.body)}\n`;
  
  fs.appendFile(logFilePath, entry, (err) => {
    if (err) console.error('Failed to write to log:', err);
  });

  next();
};

export default logger;