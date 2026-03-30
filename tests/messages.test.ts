import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('POST /messages', () => {
  it('should return 200 with the same message', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/messages')
      .send({ message: 'hello' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'hello' });
  });

  it('should return 400 when message is empty', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/messages')
      .send({ message: '' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when message is not a string', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/messages')
      .send({ message: 123 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
