import { describe, test, expect } from 'bun:test';
import { createProductId, getValue, equals } from './productId';
import { isOk, isErr } from '@shared/functional/result';

describe('ProductId値オブジェクト', () => {
  describe('createProductId', () => {
    test('正の整数値から有効なProductIdを作成できる', () => {
      const result = createProductId(1);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getValue(result.value)).toBe(1);
      }
    });

    test('0は無効なProductIdとしてエラーを返す', () => {
      const result = createProductId(0);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_ID');
      }
    });

    test('負の数値は無効なProductIdとしてエラーを返す', () => {
      const result = createProductId(-1);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_ID');
      }
    });

    test('小数値は無効なProductIdとしてエラーを返す', () => {
      const result = createProductId(1.5);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_ID');
      }
    });
  });

  describe('equals', () => {
    test('同じIDを持つProductIdは等しい', () => {
      const id1Result = createProductId(1);
      const id2Result = createProductId(1);

      expect(isOk(id1Result)).toBe(true);
      expect(isOk(id2Result)).toBe(true);

      if (isOk(id1Result) && isOk(id2Result)) {
        expect(equals(id1Result.value, id2Result.value)).toBe(true);
      }
    });

    test('異なるIDを持つProductIdは等しくない', () => {
      const id1Result = createProductId(1);
      const id2Result = createProductId(2);

      expect(isOk(id1Result)).toBe(true);
      expect(isOk(id2Result)).toBe(true);

      if (isOk(id1Result) && isOk(id2Result)) {
        expect(equals(id1Result.value, id2Result.value)).toBe(false);
      }
    });
  });
});
