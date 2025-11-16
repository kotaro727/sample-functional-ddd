import { describe, test, expect } from 'bun:test';
import { createPostalCode } from './PostalCode';
import { isOk, isErr } from '@shared/functional/result';

describe('PostalCode', () => {
  describe('createPostalCode', () => {
    test('ハイフンなしの7桁数字から PostalCode を作成できる', () => {
      const result = createPostalCode('1234567');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('PostalCode');
        expect(result.value.value).toBe('123-4567');
      }
    });

    test('ハイフンありの郵便番号から PostalCode を作成できる', () => {
      const result = createPostalCode('123-4567');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('123-4567');
      }
    });

    test('前後の空白をトリムして PostalCode を作成できる', () => {
      const result = createPostalCode('  1234567  ');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('123-4567');
      }
    });

    test('空白を含む郵便番号も正規化できる', () => {
      const result = createPostalCode('123 4567');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('123-4567');
      }
    });

    test('6桁の数字の場合はエラーを返す', () => {
      const result = createPostalCode('123456');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
        expect(result.error.message).toContain('7桁');
      }
    });

    test('8桁の数字の場合はエラーを返す', () => {
      const result = createPostalCode('12345678');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
      }
    });

    test('数字以外の文字が含まれる場合はエラーを返す', () => {
      const result = createPostalCode('123-456a');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
      }
    });

    test('空文字列の場合はエラーを返す', () => {
      const result = createPostalCode('');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
      }
    });
  });
});
