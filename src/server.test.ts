import { describe, test, expect } from 'bun:test';
import { testClient } from 'hono/testing';
import { createApp } from './server';
import { ProductRepository } from '@application/ports/productRepository';
import { createProduct } from '@domain/product/product';
import { err, ok, isOk } from '@shared/functional/result';

const createInMemoryRepository = (): ProductRepository => {
  const productResult = createProduct({
    id: 1,
    title: 'Hono Book',
    price: 1200,
    description: 'Hono migration guide',
  });

  if (!isOk(productResult)) {
    throw new Error('テストデータの生成に失敗しました');
  }

  const product = productResult.value;

  return {
    findAll: async () => ok([product] as const),
    findById: async (id: number) => {
      if (id === product.id.value) {
        return ok(product);
      }
      return err({ type: 'NOT_FOUND', message: '商品が見つかりません' });
    },
  };
};

describe('APIサーバー', () => {
  test('GET /api/products で商品一覧を取得できる', async () => {
    const client = testClient(createApp({ productRepository: createInMemoryRepository() }));
    const response = await client.api.products.$get();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
  });

  test('存在しないパスは404を返す', async () => {
    const client = testClient(createApp({ productRepository: createInMemoryRepository() }));
    const response = await client.api.notfound.$get();

    expect(response.status).toBe(404);
  });

  test('CORS対応している', async () => {
    const client = testClient(createApp({ productRepository: createInMemoryRepository() }));
    const response = await client.api.products.$options({
      header: {
        Origin: 'http://localhost:3000',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });
});
