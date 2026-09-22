import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import app from '../expressApp.js';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL as string);
}, 30000);

afterAll(async () => {
  await mongoose.connection.close();
}, 30000);

describe('Backend CRUD Operations', () => {
  let createdNoteId: string;

  it('should create a new note', async () => {
    const res = await request(app)
      .post('/notes')
      .send({
        title: 'Test Note',
        author: { name: 'Jest Tester', email: 'jest@test.com' },
        content: 'This note was created by the automated test.',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('Test Note');
    expect(res.body.content).toEqual('This note was created by the automated test.');

    createdNoteId = res.body._id;
  });

  it('should fetch notes with pagination headers', async () => {
    const res = await request(app).get('/notes');

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.headers).toHaveProperty('x-total-count');
  });

  it('should update the created note', async () => {
    const res = await request(app)
      .put(`/notes/${createdNoteId}`)
      .send({ newContent: 'Updated content' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.content).toEqual('Updated content');
  });

  it('should delete the created note', async () => {
    const res = await request(app)
      .delete(`/notes/${createdNoteId}`);

    expect(res.statusCode).toEqual(204);
  });
});