import { Router } from 'express';
import * as usersController from '../controllers/usersController.ts';

const router = Router();
router.post('/login', usersController.loginUser);
router.post('/users', usersController.createUser);

export default router;