import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import supertest from 'supertest';
import app from '../expressApp.js';
import Note from '../models/note.js';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const api = supertest(app);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL as string);
}, 30000);

afterAll(async () => {
  await Note.deleteMany({});
  await mongoose.connection.close();
}, 30000);

// ── Required test 3: GET /notes/filter ───────────────────────────────────────
describe('GET /notes/filter', () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await new Note({
      title: 'Test Note',
      content: 'super-unique-keyword-123',
      author: null,
    }).save();
  });

  test('returns 200 and array containing the seeded note', async () => {
    const response = await api
      .get('/notes/filter?query=super-unique-keyword-123')
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].content).toContain('super-unique-keyword-123');
  });

  test('returns 400 when query param is missing', async () => {
    await api.get('/notes/filter').expect(400);
  });
});