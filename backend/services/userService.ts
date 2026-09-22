import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authenticateUser = async (username: string, password: string) => {
  const user = await User.findOne({ username });
  if (!user) {
    return;
  }
  if (await bcrypt.compare(password, user.passwordHash)) {
    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name, email: user.email },
      process.env.SECRET as string,  
      { expiresIn: '24h' }
    );
    const { passwordHash, ...safeUser } = user.toObject();
    return { ...safeUser, token };
  } else {
    return;
  }
};

export const createUser = async (username: string, password: string, name: string, email: string) => {
  if (await User.findOne({ username })) {
    const err = new Error('User already exists') as Error & { status?: number };
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, passwordHash, username, email });
  const { passwordHash: _, ...safeUser } = user.toObject();
  return safeUser;
};