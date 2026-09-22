import type { Request, Response } from 'express';
import * as userService from '../services/userService.js';

export const loginUser = async (req: Request, res: Response) => {
    const {username, password} = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'username and password are required' });
        return;
    }
    const result = await userService.authenticateUser(username, password);
    if (!result){
        res.status(401).json({ error: 'failed to authenticate user'});
        return;
    }
    res.status(200).json(result);
};

export const createUser = async (req: Request, res: Response) => {
    const {name, email, username, password} = req.body;
    if (!username || !password || !email || !name) {
        res.status(400).json({ error: 'username, name, mail and password are required' });
        return;
    }
    const user = await userService.createUser(username, password, name, email);
    res.status(201).json(user);
}