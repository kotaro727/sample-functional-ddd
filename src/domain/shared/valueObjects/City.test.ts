import { describe, test, expect } from 'bun:test';
import { createCity } from './City';
import { isOk, isErr } from '@shared/functional/result';

describe('City', () => {
  describe('createCity', () => {
    test('有効な市区町村名から City を作成できる', () => {
      const result = createCity('渋谷区');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('City');
        expect(result.value.value).toBe('渋谷区');
      }
    });

    test('前後の空白をトリムして City を作成できる', () => {
      const result = createCity('  横浜市中区  ');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe('横浜市中区');
      }
    });

    test('空文字列の場合はエラーを返す', () => {
      const result = createCity('');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_CITY');
        expect(result.error.message).toContain('空');
      }
    });

    test('空白のみの場合はエラーを返す', () => {
      const result = createCity('   ');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_CITY');
      }
    });

    test('50文字を超える場合はエラーを返す', () => {
      const longCity = 'あ'.repeat(51);
      const result = createCity(longCity);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('CITY_TOO_LONG');
        expect(result.error.message).toContain('50');
      }
    });

    test('ちょうど50文字の市区町村名は作成できる', () => {
      const exactlyFifty = 'あ'.repeat(50);
      const result = createCity(exactlyFifty);

      expect(isOk(result)).toBe(true);
    });
  });
});
