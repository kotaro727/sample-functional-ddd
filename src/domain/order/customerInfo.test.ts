import { describe, it, expect } from 'bun:test';
import {
  UnvalidatedCustomerInfo,
  ValidatedCustomerInfo,
  validateCustomerInfo,
} from './customerInfo';
import { isOk, isErr } from '@shared/functional/result';

describe('CustomerInfo', () => {
  describe('validateCustomerInfo', () => {
    it('有効な顧客情報を正しく検証できる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '09012345678',
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('ValidatedCustomerInfo');
        expect(result.value.name).toBe('山田太郎');
        expect(result.value.email).toBe('yamada@example.com');
        expect(result.value.phone).toBe('09012345678');
      }
    });

    it('電話番号のハイフンを自動で削除できる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '090-1234-5678', // ハイフンあり
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.phone).toBe('09012345678'); // ハイフンなし
      }
    });

    it('10桁の固定電話番号を受け入れる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '0312345678', // 固定電話10桁
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.phone).toBe('0312345678');
      }
    });

    it('顧客名が空の場合はエラーになる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '',
        email: 'yamada@example.com',
        phone: '09012345678',
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('顧客名');
      }
    });

    it('メールアドレスの形式が不正な場合はエラーになる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'invalid-email',
        phone: '09012345678',
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_EMAIL');
        expect(result.error.message).toContain('メールアドレス');
      }
    });

    it('メールアドレスが空の場合はエラーになる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: '',
        phone: '09012345678',
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_EMAIL');
      }
    });

    it('電話番号が短すぎる場合はエラーになる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '090123456', // 9桁
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
        expect(result.error.message).toContain('電話番号');
      }
    });

    it('電話番号が長すぎる場合はエラーになる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '090123456789', // 12桁
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });

    it('電話番号が0で始まらない場合はエラーになる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '19012345678', // 0で始まらない
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });

    it('電話番号に数字以外が含まれている場合はエラーになる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '090abcd5678',
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });

    it('全てのフィールドの前後の空白を削除できる', () => {
      const unvalidated: UnvalidatedCustomerInfo = {
        name: ' 山田太郎 ',
        email: ' yamada@example.com ',
        phone: ' 090-1234-5678 ',
      };

      const result = validateCustomerInfo(unvalidated);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.name).toBe('山田太郎');
        expect(result.value.email).toBe('yamada@example.com');
        expect(result.value.phone).toBe('09012345678');
      }
    });
  });
});
