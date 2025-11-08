import { describe, test, expect } from 'bun:test';
import { createProduct, getId, getTitle, getPrice, getDescription } from './product';
import { isOk, isErr } from '@shared/functional/result';

describe('Product集約', () => {
  describe('createProduct', () => {
    test('有効なデータからProductを作成できる', () => {
      const result = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const product = result.value;
        expect(getId(product)).toBe(1);
        expect(getTitle(product)).toBe('iPhone 15');
        expect(getPrice(product)).toBe(999.99);
        expect(getDescription(product)).toBe('最新のiPhone');
      }
    });

    test('無効なIDの場合はエラーを返す', () => {
      const result = createProduct({
        id: 0,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isErr(result)).toBe(true);
    });

    test('空のタイトルの場合はエラーを返す', () => {
      const result = createProduct({
        id: 1,
        title: '',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isErr(result)).toBe(true);
    });

    test('負の価格の場合はエラーを返す', () => {
      const result = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: -100,
        description: '最新のiPhone',
      });

      expect(isErr(result)).toBe(true);
    });

    test('空の説明でもProductを作成できる', () => {
      const result = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '',
      });

      expect(isOk(result)).toBe(true);
    });
  });
});
