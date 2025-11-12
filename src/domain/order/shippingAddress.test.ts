import { describe, it, expect } from 'bun:test';
import {
  UnvalidatedShippingAddress,
  ValidatedShippingAddress,
  validateShippingAddress,
} from './shippingAddress';
import { isOk, isErr } from '@shared/functional/result';

describe('ShippingAddress', () => {
  describe('validateShippingAddress', () => {
    it('有効な住所を正しく検証できる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('ValidatedShippingAddress');
        expect(result.value.postalCode).toBe('123-4567');
        expect(result.value.prefecture).toBe('東京都');
        expect(result.value.city).toBe('渋谷区');
        expect(result.value.addressLine).toBe('神南1-2-3');
      }
    });

    it('郵便番号にハイフンを自動で追加できる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: '1234567', // ハイフンなし
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.postalCode).toBe('123-4567'); // ハイフンが追加される
      }
    });

    it('郵便番号が7桁でない場合はエラーになる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: '12345', // 5桁
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
        expect(result.error.message).toContain('郵便番号');
      }
    });

    it('郵便番号に数字以外が含まれている場合はエラーになる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: 'abc-defg',
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
      }
    });

    it('都道府県が空の場合はエラーになる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: '123-4567',
        prefecture: '',
        city: '渋谷区',
        addressLine: '神南1-2-3',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('都道府県');
      }
    });

    it('市区町村が空の場合はエラーになる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '',
        addressLine: '神南1-2-3',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('市区町村');
      }
    });

    it('町名番地が空の場合はエラーになる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '渋谷区',
        addressLine: '',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('町名番地');
      }
    });

    it('全てのフィールドの前後の空白を削除できる', () => {
      const unvalidated: UnvalidatedShippingAddress = {
        postalCode: ' 123-4567 ',
        prefecture: ' 東京都 ',
        city: ' 渋谷区 ',
        addressLine: ' 神南1-2-3 ',
      };

      const result = validateShippingAddress(unvalidated);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.postalCode).toBe('123-4567');
        expect(result.value.prefecture).toBe('東京都');
        expect(result.value.city).toBe('渋谷区');
        expect(result.value.addressLine).toBe('神南1-2-3');
      }
    });
  });
});
