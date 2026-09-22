import { Router, Request, Response, NextFunction } from 'express';
import * as aiController from '../controllers/aiController.js';
import jwt from 'jsonwebtoken';

const router = Router();
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authorization = req.get('authorization');
    
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        try {
            const token = authorization.substring(7);
            const decodedToken = jwt.verify(token, process.env.SECRET as string);
            
            if (!decodedToken) {
                res.status(401).json({ error: 'token invalid' });
                return;
            }
            next();
        } catch (err) {
            res.status(401).json({ error: 'token invalid' });
        }
    } else {
        // No token provided at all
        res.status(401).json({ error: 'token missing' });
    }
};

// The assignment says the AI assistant requires the user to be logged in (401 error).
router.post('/complete', requireAuth, aiController.complete);

export default router;