import { describe, test, expect } from 'bun:test';
import { createAddress } from './Address';
import { isOk, isErr } from '@shared/functional/result';

describe('Address', () => {
  describe('createAddress', () => {
    test('有効な住所情報から Address を作成できる', () => {
      const result = createAddress({
        postalCode: '150-0041',
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('Address');
        expect(result.value.postalCode.value).toBe('150-0041');
        expect(result.value.prefecture.value).toBe('東京都');
        expect(result.value.city.value).toBe('渋谷区');
        expect(result.value.addressLine.value).toBe('神南1-2-3');
      }
    });

    test('郵便番号が不正な場合はエラーを返す', () => {
      const result = createAddress({
        postalCode: '12345', // 7桁未満
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
      }
    });

    test('都道府県が空の場合はエラーを返す', () => {
      const result = createAddress({
        postalCode: '150-0041',
        prefecture: '',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_PREFECTURE');
      }
    });

    test('市区町村が空の場合はエラーを返す', () => {
      const result = createAddress({
        postalCode: '150-0041',
        prefecture: '東京都',
        city: '',
        addressLine: '神南1-2-3',
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_CITY');
      }
    });

    test('町名番地が空の場合はエラーを返す', () => {
      const result = createAddress({
        postalCode: '150-0041',
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '',
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_ADDRESS_LINE');
      }
    });

    test('郵便番号が正規化されて Address を作成できる', () => {
      const result = createAddress({
        postalCode: '1500041', // ハイフンなし
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.postalCode.value).toBe('150-0041');
      }
    });
  });

  describe('formatAddress', () => {
    test('Address を文字列形式にフォーマットできる', () => {
      const result = createAddress({
        postalCode: '150-0041',
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const formatted = `〒${result.value.postalCode.value} ${result.value.prefecture.value}${result.value.city.value}${result.value.addressLine.value}`;
        expect(formatted).toBe('〒150-0041 東京都渋谷区神南1-2-3');
      }
    });
  });
});
