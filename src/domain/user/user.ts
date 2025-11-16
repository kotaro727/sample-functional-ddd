import type { Email } from '@domain/shared/valueObjects/email';
import type { PasswordHash } from '@domain/shared/valueObjects/PasswordHash';
import type { ValidatedUserProfile } from './userProfile';

/**
 * User型定義
 * 純粋なドメインエンティティとしてのユーザー
 * 永続化に関する情報（ID、タイムスタンプ）を持たない
 */
export type User = {
  readonly email: Email;
  readonly passwordHash: PasswordHash;
  readonly profile: ValidatedUserProfile | null;
};

/**
 * ユーザー作成関数
 * 新しいユーザーを作成する
 * @param email - メールアドレス（検証済み）
 * @param passwordHash - ハッシュ化されたパスワード（検証済み）
 * @returns 新しいUserオブジェクト
 */
export const createUser = (email: Email, passwordHash: PasswordHash): User => {
  return {
    email,
    passwordHash,
    profile: null,
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
  };
};

