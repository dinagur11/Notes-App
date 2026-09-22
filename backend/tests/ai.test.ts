import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import supertest from 'supertest';
import app from '../expressApp.js';
import Note from '../models/note.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const api = supertest(app);
let validToken: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL as string);

  await User.deleteMany({ username: 'ai_test_user' });
  const passwordHash = await bcrypt.hash('testpass', 10);
  const user = await User.create({
    name: 'AI Test User',
    email: 'aitest@example.com',
    username: 'ai_test_user',
    passwordHash,
  });

  // Sign exactly as your loginUser controller does
  validToken = jwt.sign(
    { username: user.username, id: user._id.toString() },
    process.env.SECRET as string,
  );
}, 30000);

afterAll(async () => {
  await User.deleteMany({ username: 'ai_test_user' });
  await Note.deleteMany({});
  await mongoose.connection.close();
}, 30000);

// ── Required test 4: POST /ai/complete ───────────────────────────────────────
describe('POST /ai/complete', () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await Note.create({
      title: 'Important',
      content: 'cryptographic-handshake-v7',
      author: null,
    });
  });

  test(
    'returns 200 and response text contains the seeded keyword',
    async () => {
      const response = await api
        .post('/ai/complete')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          prompt:
            'Find the note that mentions cryptographic-handshake-v7 and tell me what identifier my project uses.',
        })
        .expect(200);

      expect(response.body).toHaveProperty('text');
      expect(typeof response.body.text).toBe('string');
      expect(response.body.text).toContain('cryptographic-handshake-v7');
    },
    60_000,
  );
});