import { describe, test, expect } from 'bun:test';
import { OpenAPIHono } from '@hono/zod-openapi';
import { testClient } from 'hono/testing';
import { createProductRoutes } from '@presentation/api/routes/productRoutes';
import { ProductRepository } from '@application/ports/productRepository';
import { createProduct } from '@domain/product/product';
import { ok, err, isOk } from '@shared/functional/result';

const createTestClient = (repository: ProductRepository) => {
  const app = new OpenAPIHono();
  app.route('/api', createProductRoutes(repository));
  return testClient(app);
};

describe('ProductController', () => {
  describe('GET /products', () => {
    test('商品一覧を取得して200を返す', async () => {
      // テスト用のリポジトリを作成
      const product1Result = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });
      const product2Result = createProduct({
        id: 2,
        title: 'MacBook Pro',
        price: 2499.99,
        description: '高性能ノートPC',
      });

      expect(isOk(product1Result)).toBe(true);
      expect(isOk(product2Result)).toBe(true);

      if (!isOk(product1Result) || !isOk(product2Result)) {
        throw new Error('テストデータの作成に失敗');
      }

      const testRepository: ProductRepository = {
        findAll: async () => ok([product1Result.value, product2Result.value] as const),
        findById: async () => err({ type: 'NOT_FOUND', message: 'Not implemented' }),
      };

      // Honoルーターにコントローラーをマウント
      const client = createTestClient(testRepository);
      const response = await client.api.products.$get();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.products).toBeDefined();
      expect(body.products.length).toBe(2);
      expect(body.products[0].id).toBe(1);
      expect(body.products[0].title).toBe('iPhone 15');
      expect(body.products[0].price).toBe(999.99);
    });

    test('リポジトリエラー時は500を返す', async () => {
      const testRepository: ProductRepository = {
        findAll: async () => err({ type: 'NETWORK_ERROR', message: 'ネットワークエラー' }),
        findById: async () => err({ type: 'NOT_FOUND', message: 'Not implemented' }),
      };

      const client = createTestClient(testRepository);
      const response = await client.api.products.$get();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBeDefined();
    });

    test('空の商品一覧でも200を返す', async () => {
      const testRepository: ProductRepository = {
        findAll: async () => ok([] as const),
        findById: async () => err({ type: 'NOT_FOUND', message: 'Not implemented' }),
      };

      const client = createTestClient(testRepository);
      const response = await client.api.products.$get();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.products).toEqual([]);
    });
  });

  describe('GET /products/:id', () => {
    test('商品詳細を取得して200を返す', async () => {
      const productResult = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isOk(productResult)).toBe(true);
      if (!isOk(productResult)) {
        throw new Error('テストデータの作成に失敗');
      }

      const testRepository: ProductRepository = {
        findAll: async () => ok([]),
        findById: async (id: number) => {
          if (id === 1) {
            return ok(productResult.value);
          }
          return err({ type: 'NOT_FOUND', message: '商品が見つかりません' });
        },
      };

      const client = createTestClient(testRepository);
      const response = await client.api.products[':id'].$get({ param: { id: 1 } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBe(1);
      expect(body.title).toBe('iPhone 15');
      expect(body.price).toBe(999.99);
      expect(body.description).toBe('最新のiPhone');
    });

    test('存在しない商品IDで404を返す', async () => {
      const testRepository: ProductRepository = {
        findAll: async () => ok([]),
        findById: async (id: number) => {
          return err({ type: 'NOT_FOUND', message: '商品が見つかりません' });
        },
      };

      const client = createTestClient(testRepository);
      const response = await client.api.products[':id'].$get({ param: { id: 999 } });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBeDefined();
      expect(body.error.type).toBe('NOT_FOUND');
    });

    test('リポジトリエラー時は500を返す', async () => {
      const testRepository: ProductRepository = {
        findAll: async () => ok([]),
        findById: async (id: number) => {
          return err({ type: 'NETWORK_ERROR', message: 'ネットワークエラー' });
        },
      };

      const client = createTestClient(testRepository);
      const response = await client.api.products[':id'].$get({ param: { id: 1 } });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBeDefined();
    });
  });
});
