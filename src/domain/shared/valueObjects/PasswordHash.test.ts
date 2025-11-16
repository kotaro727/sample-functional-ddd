import { describe, test, expect } from 'bun:test';
import { createPasswordHash } from './PasswordHash';
import { isOk, isErr } from '@shared/functional/result';

describe('PasswordHash', () => {
  describe('createPasswordHash', () => {
    test('有効なbcryptハッシュから PasswordHash を作成できる', () => {
      // bcryptハッシュの形式: $2a$10$... または $2b$12$... など
      const validHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
      const result = createPasswordHash(validHash);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value._tag).toBe('PasswordHash');
        expect(result.value.value).toBe(validHash);
      }
    });

    test('$2b$プレフィックスのbcryptハッシュも作成できる', () => {
      const validHash = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
      const result = createPasswordHash(validHash);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe(validHash);
      }
    });

    test('空文字列の場合はエラーを返す', () => {
      const result = createPasswordHash('');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_PASSWORD_HASH');
        expect(result.error.message).toContain('空');
      }
    });

    test('bcryptの形式でない場合はエラーを返す', () => {
      const result = createPasswordHash('plain-text-password');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PASSWORD_HASH_FORMAT');
        expect(result.error.message).toContain('bcrypt');
      }
    });

    test('不正なプレフィックスの場合はエラーを返す', () => {
      const result = createPasswordHash('$3a$10$invalidhash');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PASSWORD_HASH_FORMAT');
      }
    });

    test('短すぎるハッシュの場合はエラーを返す', () => {
      const result = createPasswordHash('$2a$10$short');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PASSWORD_HASH_FORMAT');
      }
    });

    test('前後の空白はエラーとなる（正規化しない）', () => {
      const result = createPasswordHash('  $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy  ');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PASSWORD_HASH_FORMAT');
      }
    });
  });
});
