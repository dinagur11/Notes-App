import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import app from '../expressApp.js';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL as string);
  await User.deleteMany({});
}, 30000);

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
}, 30000);

// ── Required test 1: POST /users ─────────────────────────────────────────────
describe('POST /users', () => {
  test('creates a user, returns 201, persists to DB with hashed password', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).not.toHaveProperty('passwordHash');

    const saved = await User.findOne({ username: 'testuser' });
    expect(saved).not.toBeNull();
    expect(saved!.name).toBe('Test User');
    expect(saved!.email).toBe('testuser@example.com');

    const hashMatches = await bcrypt.compare('password123', saved!.passwordHash);
    expect(hashMatches).toBe(true);
  });
});

// ── Required test 2: POST /login ─────────────────────────────────────────────
describe('POST /login', () => {
  beforeAll(async () => {
    // Seed a dedicated user directly — don't chain on the /users test above
    const passwordHash = await bcrypt.hash('securepass', 10);
    await User.create({
      name: 'Login Tester',
      email: 'login@example.com',
      username: 'loginuser',
      passwordHash,
    });
  }, 30000);

  test('returns 200 and a signed token for valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'loginuser', password: 'securepass' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'loginuser', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  test('returns 401 for non-existent user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'nobody', password: 'anything' });

    expect(res.statusCode).toBe(401);
  });
});

// ── /ai/complete auth guard ───────────────────────────────────────────────────
describe('POST /ai/complete — auth guard', () => {
  test('returns 401 with no token', async () => {
    const res = await request(app)
      .post('/ai/complete')
      .send({ prompt: 'Hello' });

    expect(res.statusCode).toBe(401);
  });

  test('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .post('/ai/complete')
      .set('Authorization', 'Bearer this.is.not.valid')
      .send({ prompt: 'Hello' });

    expect(res.statusCode).toBe(401);
  });
});