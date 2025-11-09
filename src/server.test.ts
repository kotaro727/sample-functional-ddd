import { describe, test, expect } from 'bun:test';
import request from 'supertest';
import { createApp } from './server';

describe('APIサーバー', () => {
  test('GET /api/products で商品一覧を取得できる', async () => {
    const app = createApp();
    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body.products).toBeDefined();
    expect(Array.isArray(response.body.products)).toBe(true);
  });

  test('存在しないパスは404を返す', async () => {
    const app = createApp();
    const response = await request(app).get('/api/notfound');

    expect(response.status).toBe(404);
  });

  test('CORS対応している', async () => {
    const app = createApp();
    const response = await request(app)
      .options('/api/products')
      .set('Origin', 'http://localhost:3000');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
