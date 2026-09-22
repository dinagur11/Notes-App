import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Requires authentication token') as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET || 'your-default-secret';
  const decoded = jwt.verify(token, secret);
  (req as any).user = decoded;
  next();
};

export default requireAuth;