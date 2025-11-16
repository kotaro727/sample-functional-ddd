import { describe, test, expect } from 'bun:test';
import { createPhoneNumber } from './PhoneNumber';
import { isOk, isErr } from '@shared/functional/result';

describe('PhoneNumber', () => {
  describe('createPhoneNumber', () => {
    test('ハイフンなしの11桁数字から PhoneNumber を作成できる', () => {
      const result = createPhoneNumber('09012345678');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('PhoneNumber');
        expect(result.value.value).toBe('090-1234-5678');
      }
    });

    test('ハイフンなしの10桁数字から PhoneNumber を作成できる', () => {
      const result = createPhoneNumber('0312345678');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('03-1234-5678');
      }
    });

    test('ハイフンありの電話番号から PhoneNumber を作成できる', () => {
      const result = createPhoneNumber('090-1234-5678');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('090-1234-5678');
      }
    });

    test('前後の空白をトリムして PhoneNumber を作成できる', () => {
      const result = createPhoneNumber('  09012345678  ');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('090-1234-5678');
      }
    });

    test('空白を含む電話番号も正規化できる', () => {
      const result = createPhoneNumber('090 1234 5678');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('090-1234-5678');
      }
    });

    test('9桁の数字の場合はエラーを返す', () => {
      const result = createPhoneNumber('031234567');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
        expect(result.error.message).toContain('10桁または11桁');
      }
    });

    test('12桁の数字の場合はエラーを返す', () => {
      const result = createPhoneNumber('090123456789');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });

    test('数字以外の文字が含まれる場合はエラーを返す', () => {
      const result = createPhoneNumber('090-1234-567a');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });

    test('空文字列の場合はエラーを返す', () => {
      const result = createPhoneNumber('');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });
  });
});
