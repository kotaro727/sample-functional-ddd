import { describe, test, expect } from 'bun:test';
import {
  createUser,
  updateProfile,
  type User,
} from './user';
import { createEmail } from '@domain/shared/valueObjects/email';
import { validateUserProfile } from './userProfile';
import { isOk } from '@shared/functional/result';

describe('Userエンティティ', () => {
  describe('createUser - ユーザー作成', () => {
    test('正常: ユーザーを作成できる', () => {
      const emailResult = createEmail('test@example.com');
      expect(isOk(emailResult)).toBe(true);

      if (isOk(emailResult)) {
        const passwordHash = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890';
        const user = createUser(emailResult.value, passwordHash);

        expect(user.id).toBe(0); // 初期値
        expect(user.email.value).toBe('test@example.com');
        expect(user.passwordHash).toBe(passwordHash);
        expect(user.profile).toBeNull();
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
      }
    });

    test('正常: 作成日時と更新日時は同じになる', () => {
      const emailResult = createEmail('test@example.com');
      if (isOk(emailResult)) {
        const user = createUser(emailResult.value, 'hashedPassword');
        expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
      }
    });

    test('正常: プロフィールは初期状態でnull', () => {
      const emailResult = createEmail('test@example.com');
      if (isOk(emailResult)) {
        const user = createUser(emailResult.value, 'hashedPassword');
        expect(user.profile).toBeNull();
      }
    });
  });

  describe('updateProfile - プロフィール更新', () => {
    test('正常: プロフィールを更新できる', () => {
      const emailResult = createEmail('test@example.com');
      expect(isOk(emailResult)).toBe(true);

      if (isOk(emailResult)) {
        const user = createUser(emailResult.value, 'hashedPassword');

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
          expect(updatedUser.profile?.name).toBe('山田太郎');
          expect(updatedUser.profile?.address.postalCode).toBe('123-4567');
          expect(updatedUser.profile?.address.prefecture).toBe('東京都');
          expect(updatedUser.profile?.address.city).toBe('渋谷区');
          expect(updatedUser.profile?.address.addressLine).toBe('渋谷1-2-3');
          expect(updatedUser.profile?.phone).toBe('090-1234-5678');
        }
      }
    });

    test('正常: プロフィール更新時にupdatedAtが更新される', () => {
      const emailResult = createEmail('test@example.com');
      if (isOk(emailResult)) {
        const user = createUser(emailResult.value, 'hashedPassword');
        const originalUpdatedAt = user.updatedAt;

        // 少し時間を置く
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
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
          delay(10).then(() => {
            const updatedUser = updateProfile(user, profileResult.value);
            expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
          });
        }
      }
    });

    test('正常: プロフィール更新時にcreatedAtは変わらない', () => {
      const emailResult = createEmail('test@example.com');
      if (isOk(emailResult)) {
        const user = createUser(emailResult.value, 'hashedPassword');
        const originalCreatedAt = user.createdAt;

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
          expect(updatedUser.createdAt).toBe(originalCreatedAt);
        }
      }
    });

    test('正常: プロフィールを複数回更新できる', () => {
      const emailResult = createEmail('test@example.com');
      if (isOk(emailResult)) {
        const user = createUser(emailResult.value, 'hashedPassword');

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
          expect(updatedUser1.profile?.name).toBe('山田太郎');

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
            expect(updatedUser2.profile?.name).toBe('佐藤花子');
            expect(updatedUser2.profile?.address.prefecture).toBe('大阪府');
          }
        }
      }
    });

    test('正常: 元のUserオブジェクトは変更されない（イミュータブル）', () => {
      const emailResult = createEmail('test@example.com');
      if (isOk(emailResult)) {
        const user = createUser(emailResult.value, 'hashedPassword');

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

