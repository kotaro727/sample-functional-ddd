import { describe, test, expect } from 'bun:test';
import { getProducts } from './getProducts';
import { ProductRepository } from '@application/ports/productRepository';
import { createProduct } from '@domain/product/product';
import { ok, err, isOk, isErr } from '@shared/functional/result';

describe('getProducts ユースケース', () => {
  test('リポジトリから商品一覧を取得できる', async () => {
    // テスト用のProductRepositoryを実装（モックを使わない）
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

    const result = await getProducts(testRepository)();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.length).toBe(2);
      expect(result.value[0]).toEqual(product1Result.value);
      expect(result.value[1]).toEqual(product2Result.value);
    }
  });

  test('リポジトリがエラーを返した場合、エラーを伝播する', async () => {
    const testRepository: ProductRepository = {
      findAll: async () =>
        err({ type: 'NETWORK_ERROR', message: 'ネットワークエラー' }),
      findById: async () => err({ type: 'NOT_FOUND', message: 'Not implemented' }),
    };

    const result = await getProducts(testRepository)();

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.type).toBe('NETWORK_ERROR');
      expect(result.error.message).toBe('ネットワークエラー');
    }
  });

  test('空の商品一覧を取得できる', async () => {
    const testRepository: ProductRepository = {
      findAll: async () => ok([] as const),
      findById: async () => err({ type: 'NOT_FOUND', message: 'Not implemented' }),
    };

    const result = await getProducts(testRepository)();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.length).toBe(0);
    }
  });
});
