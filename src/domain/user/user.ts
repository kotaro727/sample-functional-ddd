import type { Email } from '@domain/shared/valueObjects/email';
import type { ValidatedUserProfile } from './userProfile';

/**
 * User型定義
 * ドメインエンティティとしてのユーザー
 */
export type User = {
  readonly id: number;
  readonly email: Email;
  readonly passwordHash: string;
  readonly profile: ValidatedUserProfile | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 * ユーザー作成関数
 * 新しいユーザーを作成する
 * @param email - メールアドレス（検証済み）
 * @param passwordHash - ハッシュ化されたパスワード
 * @returns 新しいUserオブジェクト
 */
export const createUser = (email: Email, passwordHash: string): User => {
  const now = new Date();
  return {
    id: 0, // IDは永続化時にリポジトリで設定される
    email,
    passwordHash,
    profile: null,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * プロフィール更新関数
 * ユーザーのプロフィール情報を更新する
 * @param user - 更新対象のユーザー
 * @param profile - 新しいプロフィール情報（検証済み）
 * @returns プロフィールが更新された新しいUserオブジェクト
 */
export const updateProfile = (user: User, profile: ValidatedUserProfile): User => {
  return {
    ...user,
    profile,
    updatedAt: new Date(),
  };
};

