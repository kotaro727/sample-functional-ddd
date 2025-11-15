import { describe, test, expect } from 'bun:test';
import {
  validatePassword,
  hashPassword,
  verifyPassword,
  type PasswordValidationError,
} from './password';
import { isOk, isErr } from '@shared/functional/result';

describe('Password値オブジェクト', () => {
  describe('validatePassword - パスワードのバリデーション', () => {
    test('正常: 8文字以上のパスワードは検証に成功する', () => {
      const result = validatePassword('password123');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('password123');
      }
    });

    test('正常: ちょうど8文字のパスワードは検証に成功する', () => {
      const result = validatePassword('pass1234');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe('pass1234');
      }
    });

    test('異常: 空文字列はエラーになる', () => {
      const result = validatePassword('');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY');
        expect(result.error.message).toBe('パスワードが空です');
      }
    });

    test('異常: 空白文字のみはエラーになる', () => {
      const result = validatePassword('   ');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY');
      }
    });

    test('異常: 7文字以下のパスワードはエラーになる', () => {
      const result = validatePassword('pass123');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('TOO_SHORT');
        expect(result.error.message).toBe('パスワードは最低8文字必要です');
      }
    });
  });

  describe('hashPassword - パスワードのハッシュ化', () => {
    test('正常: パスワードをハッシュ化できる', async () => {
      const plainPassword = 'password123';
      const result = await hashPassword(plainPassword);
      
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        // ハッシュは元のパスワードと異なる
        expect(result.value).not.toBe(plainPassword);
        // bcryptのハッシュは$2a$または$2b$で始まる
        expect(result.value).toMatch(/^\$2[ab]\$/);
      }
    });

    test('正常: 同じパスワードでも毎回異なるハッシュが生成される（salt）', async () => {
      const plainPassword = 'password123';
      const result1 = await hashPassword(plainPassword);
      const result2 = await hashPassword(plainPassword);
      
      expect(isOk(result1)).toBe(true);
      expect(isOk(result2)).toBe(true);
      
      if (isOk(result1) && isOk(result2)) {
        // 同じパスワードでも異なるハッシュ
        expect(result1.value).not.toBe(result2.value);
      }
    });
  });

  describe('verifyPassword - パスワードの検証', () => {
    test('正常: 正しいパスワードで検証に成功する', async () => {
      const plainPassword = 'password123';
      const hashResult = await hashPassword(plainPassword);
      
      expect(isOk(hashResult)).toBe(true);
      if (isOk(hashResult)) {
        const verifyResult = await verifyPassword(plainPassword, hashResult.value);
        expect(isOk(verifyResult)).toBe(true);
        if (isOk(verifyResult)) {
          expect(verifyResult.value).toBe(true);
        }
      }
    });

    test('異常: 間違ったパスワードで検証に失敗する', async () => {
      const plainPassword = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashResult = await hashPassword(plainPassword);
      
      expect(isOk(hashResult)).toBe(true);
      if (isOk(hashResult)) {
        const verifyResult = await verifyPassword(wrongPassword, hashResult.value);
        expect(isOk(verifyResult)).toBe(true);
        if (isOk(verifyResult)) {
          expect(verifyResult.value).toBe(false);
        }
      }
    });

    test('異常: 無効なハッシュ形式の場合、検証はfalseを返す', async () => {
      const result = await verifyPassword('password123', 'invalid-hash');
      // bcryptは無効なハッシュでも例外を投げずfalseを返す
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toBe(false);
      }
    });
  });
});

