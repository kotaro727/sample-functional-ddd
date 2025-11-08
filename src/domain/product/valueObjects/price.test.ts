import { describe, test, expect } from 'bun:test';
import { createPrice, getValue, equals } from './price';
import { isOk, isErr } from '@shared/functional/result';

describe('Price値オブジェクト', () => {
  describe('createPrice', () => {
    test('正の数値から有効なPriceを作成できる', () => {
      const result = createPrice(100);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getValue(result.value)).toBe(100);
      }
    });

    test('小数点を含む正の数値から有効なPriceを作成できる', () => {
      const result = createPrice(99.99);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getValue(result.value)).toBe(99.99);
      }
    });

    test('0は有効なPriceとして作成できる', () => {
      const result = createPrice(0);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getValue(result.value)).toBe(0);
      }
    });

    test('負の数値は無効なPriceとしてエラーを返す', () => {
      const result = createPrice(-10);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('NEGATIVE_PRICE');
      }
    });
  });

  describe('equals', () => {
    test('同じ価格を持つPriceは等しい', () => {
      const price1Result = createPrice(100);
      const price2Result = createPrice(100);

      expect(isOk(price1Result)).toBe(true);
      expect(isOk(price2Result)).toBe(true);

      if (isOk(price1Result) && isOk(price2Result)) {
        expect(equals(price1Result.value, price2Result.value)).toBe(true);
      }
    });

    test('異なる価格を持つPriceは等しくない', () => {
      const price1Result = createPrice(100);
      const price2Result = createPrice(200);

      expect(isOk(price1Result)).toBe(true);
      expect(isOk(price2Result)).toBe(true);

      if (isOk(price1Result) && isOk(price2Result)) {
        expect(equals(price1Result.value, price2Result.value)).toBe(false);
      }
    });
  });
});
