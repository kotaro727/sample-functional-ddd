import { describe, test, expect } from 'bun:test';
import {
  validateUserProfile,
  type UnvalidatedUserProfile,
  type UserProfileValidationError,
} from './userProfile';
import { isOk, isErr } from '@shared/functional/result';

describe('UserProfile値オブジェクト', () => {
  describe('validateUserProfile - ユーザープロフィールのバリデーション', () => {
    test('正常: 正しいプロフィール情報は検証に成功する', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '山田太郎',
        address: {
          postalCode: '1234567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '渋谷1-2-3',
        },
        phone: '09012345678',
      };

      const result = validateUserProfile(unvalidated);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.name).toBe('山田太郎');
        expect(result.value.address.postalCode).toBe('123-4567'); // 正規化される
        expect(result.value.address.prefecture).toBe('東京都');
        expect(result.value.address.city).toBe('渋谷区');
        expect(result.value.address.addressLine).toBe('渋谷1-2-3');
        expect(result.value.phone).toBe('090-1234-5678'); // 正規化される
      }
    });

    test('正常: ハイフン付きの郵便番号と電話番号も検証に成功する', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '佐藤花子',
        address: {
          postalCode: '123-4567',
          prefecture: '大阪府',
          city: '大阪市',
          addressLine: '梅田1-1-1',
        },
        phone: '080-9876-5432',
      };

      const result = validateUserProfile(unvalidated);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.address.postalCode).toBe('123-4567');
        expect(result.value.phone).toBe('080-9876-5432');
      }
    });

    test('異常: 名前が空の場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '',
        address: {
          postalCode: '1234567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '渋谷1-2-3',
        },
        phone: '09012345678',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('名前');
      }
    });

    test('異常: 名前が空白文字のみの場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '   ',
        address: {
          postalCode: '1234567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '渋谷1-2-3',
        },
        phone: '09012345678',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
      }
    });

    test('異常: 郵便番号が不正な形式の場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '山田太郎',
        address: {
          postalCode: '123',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '渋谷1-2-3',
        },
        phone: '09012345678',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_POSTAL_CODE');
      }
    });

    test('異常: 都道府県が空の場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '山田太郎',
        address: {
          postalCode: '1234567',
          prefecture: '',
          city: '渋谷区',
          addressLine: '渋谷1-2-3',
        },
        phone: '09012345678',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('都道府県');
      }
    });

    test('異常: 市区町村が空の場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '山田太郎',
        address: {
          postalCode: '1234567',
          prefecture: '東京都',
          city: '',
          addressLine: '渋谷1-2-3',
        },
        phone: '09012345678',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('市区町村');
      }
    });

    test('異常: 町名番地が空の場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '山田太郎',
        address: {
          postalCode: '1234567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '',
        },
        phone: '09012345678',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('EMPTY_FIELD');
        expect(result.error.message).toContain('町名番地');
      }
    });

    test('異常: 電話番号が不正な形式の場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '山田太郎',
        address: {
          postalCode: '1234567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '渋谷1-2-3',
        },
        phone: '123',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });

    test('異常: 電話番号が空の場合エラーになる', () => {
      const unvalidated: UnvalidatedUserProfile = {
        name: '山田太郎',
        address: {
          postalCode: '1234567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '渋谷1-2-3',
        },
        phone: '',
      };

      const result = validateUserProfile(unvalidated);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PHONE');
      }
    });
  });
});

