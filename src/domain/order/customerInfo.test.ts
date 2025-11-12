import { describe, it, expect } from 'bun:test';
import {
  UnvalidatedCustomerInfo,
  ValidatedCustomerInfo,
  validateCustomerInfo,
} from './customerInfo';
import { isOk, isErr } from '@shared/functional/result';

describe('CustomerInfo', () => {
  describe('validateCustomerInfo', () => {
    it('should successfully validate valid customer info', () => {
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

    it('should normalize phone number by removing hyphens', () => {
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

    it('should accept 10-digit landline numbers', () => {
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

    it('should fail if name is empty', () => {
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

    it('should fail if email format is invalid', () => {
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

    it('should fail if email is empty', () => {
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

    it('should fail if phone number is too short', () => {
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

    it('should fail if phone number is too long', () => {
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

    it('should fail if phone number does not start with 0', () => {
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

    it('should fail if phone number contains non-digits', () => {
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

    it('should trim whitespace from all fields', () => {
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
