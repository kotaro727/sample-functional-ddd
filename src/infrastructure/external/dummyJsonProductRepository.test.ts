import { describe, test, expect } from 'bun:test';
import { createDummyJsonProductRepository } from './dummyJsonProductRepository';
import { isOk, isErr } from '@shared/functional/result';

describe('DummyJsonProductRepository', () => {
  describe('findAll', () => {
    test('DummyJSON APIから商品一覧を取得できる', async () => {
      const repository = createDummyJsonProductRepository();
      const result = await repository.findAll();

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);

        // 最初の商品の構造を確認
        const firstProduct = result.value[0];
        expect(firstProduct).toBeDefined();
        expect(typeof firstProduct.id).toBe('object'); // ProductId型
        expect(typeof firstProduct.title).toBe('string');
        expect(typeof firstProduct.price).toBe('object'); // Price型
        expect(typeof firstProduct.description).toBe('string');
      }
    });

    test('取得した商品データがProductドメインモデルに変換されている', async () => {
      const repository = createDummyJsonProductRepository();
      const result = await repository.findAll();

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const product = result.value[0];

        // ProductIdとPriceが値オブジェクトであることを確認
        expect(product.id).toHaveProperty('_brand', 'ProductId');
        expect(product.price).toHaveProperty('_brand', 'Price');
      }
    });
  });

  describe('findById', () => {
    test('指定したIDの商品を取得できる', async () => {
      const repository = createDummyJsonProductRepository();
      const result = await repository.findById(1);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBeDefined();
        expect(result.value.id).toHaveProperty('value', 1);
      }
    });

    test('存在しないIDの場合はエラーを返す', async () => {
      const repository = createDummyJsonProductRepository();
      const result = await repository.findById(999999);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });
});
