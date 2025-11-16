import { describe, test, expect } from 'bun:test';
import {
  createUser,
  updateProfile,
  type User,
} from './user';
import { createEmail } from '@domain/shared/valueObjects/email';
import { createPasswordHash } from '@domain/shared/valueObjects/PasswordHash';
import { validateUserProfile } from './userProfile';
import { isOk } from '@shared/functional/result';

describe('Userエンティティ', () => {
  describe('createUser - ユーザー作成', () => {
    test('正常: ユーザーを作成できる', () => {
      const emailResult = createEmail('test@example.com');
      const passwordHashResult = createPasswordHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

      expect(isOk(emailResult) && isOk(passwordHashResult)).toBe(true);

      if (isOk(emailResult) && isOk(passwordHashResult)) {
        const user = createUser(emailResult.value, passwordHashResult.value);

        expect(user.email.value).toBe('test@example.com');
        expect(user.passwordHash.value).toBe('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
        expect(user.profile).toBeNull();
      }
    });

    test('正常: プロフィールは初期状態でnull', () => {
      const emailResult = createEmail('test@example.com');
      const passwordHashResult = createPasswordHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

      if (isOk(emailResult) && isOk(passwordHashResult)) {
        const user = createUser(emailResult.value, passwordHashResult.value);
        expect(user.profile).toBeNull();
      }
    });
  });

  describe('updateProfile - プロフィール更新', () => {
    test('正常: プロフィールを更新できる', () => {
      const emailResult = createEmail('test@example.com');
      const passwordHashResult = createPasswordHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

      expect(isOk(emailResult) && isOk(passwordHashResult)).toBe(true);

      if (isOk(emailResult) && isOk(passwordHashResult)) {
        const user = createUser(emailResult.value, passwordHashResult.value);

        const profileResult = validateUserProfile({
          name: '山田太郎',
          address: {
            postalCode: '1234567',
            prefecture: '東京都',
            city: '渋谷区',
            addressLine: '渋谷1-2-3',
          },
          phone: '09012345678',
        });
        expect(isOk(profileResult)).toBe(true);

        if (isOk(profileResult)) {
          const updatedUser = updateProfile(user, profileResult.value);

          expect(updatedUser.profile).not.toBeNull();
          expect(updatedUser.profile?.name.value).toBe('山田太郎');
          expect(updatedUser.profile?.address.postalCode.value).toBe('123-4567');
          expect(updatedUser.profile?.address.prefecture.value).toBe('東京都');
          expect(updatedUser.profile?.address.city.value).toBe('渋谷区');
          expect(updatedUser.profile?.address.addressLine.value).toBe('渋谷1-2-3');
          expect(updatedUser.profile?.phone.value).toBe('090-1234-5678');
        }
      }
    });

    test('正常: プロフィールを複数回更新できる', () => {
      const emailResult = createEmail('test@example.com');
      const passwordHashResult = createPasswordHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

      if (isOk(emailResult) && isOk(passwordHashResult)) {
        const user = createUser(emailResult.value, passwordHashResult.value);

        // 1回目の更新
        const profile1Result = validateUserProfile({
          name: '山田太郎',
          address: {
            postalCode: '1234567',
            prefecture: '東京都',
            city: '渋谷区',
            addressLine: '渋谷1-2-3',
          },
          phone: '09012345678',
        });

        if (isOk(profile1Result)) {
          const updatedUser1 = updateProfile(user, profile1Result.value);
          expect(updatedUser1.profile?.name.value).toBe('山田太郎');

          // 2回目の更新
          const profile2Result = validateUserProfile({
            name: '佐藤花子',
            address: {
              postalCode: '9876543',
              prefecture: '大阪府',
              city: '大阪市',
              addressLine: '梅田1-1-1',
            },
            phone: '08098765432',
          });

          if (isOk(profile2Result)) {
            const updatedUser2 = updateProfile(updatedUser1, profile2Result.value);
            expect(updatedUser2.profile?.name.value).toBe('佐藤花子');
            expect(updatedUser2.profile?.address.prefecture.value).toBe('大阪府');
          }
        }
      }
    });

    test('正常: 元のUserオブジェクトは変更されない（イミュータブル）', () => {
      const emailResult = createEmail('test@example.com');
      const passwordHashResult = createPasswordHash('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

      if (isOk(emailResult) && isOk(passwordHashResult)) {
        const user = createUser(emailResult.value, passwordHashResult.value);

        const profileResult = validateUserProfile({
          name: '山田太郎',
          address: {
            postalCode: '1234567',
            prefecture: '東京都',
            city: '渋谷区',
            addressLine: '渋谷1-2-3',
          },
          phone: '09012345678',
        });

        if (isOk(profileResult)) {
          const updatedUser = updateProfile(user, profileResult.value);

          // 元のユーザーは変更されていない
          expect(user.profile).toBeNull();
          // 新しいユーザーは更新されている
          expect(updatedUser.profile).not.toBeNull();
        }
      }
    });
  });
});

