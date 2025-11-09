import { describe, test, expect } from 'bun:test';
import { getProductById } from './getProductById';
import type { ProductRepository } from '@application/ports/productRepository';
import { createProduct } from '@domain/product/product';
import { ok, err } from '@shared/functional/result';

describe('getProductById', () => {
  test('商品IDで商品を取得できる', async () => {
    // 成功するリポジトリのモック
    const mockRepository: ProductRepository = {
      findAll: async () => ok([]),
      findById: async (id: number) => {
        const productResult = createProduct({
          id: 1,
          title: 'テスト商品',
          price: 100,
          description: 'テスト用の商品です',
        });
        return productResult;
      },
    };

    const usecase = getProductById(mockRepository);
    const result = await usecase(1);

    expect(result._tag).toBe('Ok');
    if (result._tag === 'Ok') {
      expect(result.value.id).toEqual({ _brand: 'ProductId', value: 1 });
      expect(result.value.title).toBe('テスト商品');
    }
  });

  test('存在しない商品IDでエラーを返す', async () => {
    // 失敗するリポジトリのモック
    const mockRepository: ProductRepository = {
      findAll: async () => ok([]),
      findById: async (id: number) => {
        return err({ type: 'NOT_FOUND', message: '商品が見つかりません' });
      },
    };

    const usecase = getProductById(mockRepository);
    const result = await usecase(999);

    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error.type).toBe('NOT_FOUND');
      expect(result.error.message).toBe('商品が見つかりません');
    }
  });

  test('リポジトリエラーを伝播する', async () => {
    // エラーを返すリポジトリのモック
    const mockRepository: ProductRepository = {
      findAll: async () => ok([]),
      findById: async (id: number) => {
        return err({ type: 'NETWORK_ERROR', message: 'ネットワークエラー' });
      },
    };

    const usecase = getProductById(mockRepository);
    const result = await usecase(1);

    expect(result._tag).toBe('Err');
    if (result._tag === 'Err') {
      expect(result.error.type).toBe('NETWORK_ERROR');
    }
  });
});
