import { describe, test, expect } from 'bun:test';
import { createAddressLine } from './AddressLine';
import { isOk, isErr } from '@shared/functional/result';

describe('AddressLine', () => {
  describe('createAddressLine', () => {
    test('有効な町名番地から AddressLine を作成できる', () => {
      const result = createAddressLine('神南1-2-3');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('AddressLine');
        expect(result.value.value).toBe('神南1-2-3');
      }
    });

    test('前後の空白をトリムして AddressLine を作成できる', () => {
      const result = createAddressLine('  赤坂9-7-1  ');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('赤坂9-7-1');
      }
    });

    test('マンション名を含む住所を作成できる', () => {
      const result = createAddressLine('神南1-2-3 ABCビル4階');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('神南1-2-3 ABCビル4階');
      }
    });

    test('空文字列の場合はエラーを返す', () => {
      const result = createAddressLine('');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_ADDRESS_LINE');
        expect(result.error.message).toContain('空');
      }
    });

    test('空白のみの場合はエラーを返す', () => {
      const result = createAddressLine('   ');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_ADDRESS_LINE');
      }
    });

    test('100文字を超える場合はエラーを返す', () => {
      const longAddress = 'あ'.repeat(101);
      const result = createAddressLine(longAddress);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('ADDRESS_LINE_TOO_LONG');
        expect(result.error.message).toContain('100');
      }
    });

    test('ちょうど100文字の町名番地は作成できる', () => {
      const exactlyHundred = 'あ'.repeat(100);
      const result = createAddressLine(exactlyHundred);

      expect(isOk(result)).toBe(true);
    });
  });
});
