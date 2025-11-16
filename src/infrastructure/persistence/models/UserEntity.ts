import type { User } from '@domain/user/user';

/**
 * UserEntity - 永続化層で使用するユーザーエンティティ
 * ドメインモデルに永続化に必要な情報を追加
 */
export type UserEntity = User & {
  readonly id: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 * ドメインモデルから永続化エンティティを作成
 * @param user - ドメインモデルのUser
 * @param id - データベースから割り当てられたID
 * @param timestamps - タイムスタンプ情報
 * @returns 永続化用のUserEntity
 */
export const toUserEntity = (
  user: User,
  id: number,
  timestamps: { createdAt: Date; updatedAt: Date }
): UserEntity => {
  return {
    ...user,
    id,
    ...timestamps,
  };
};

/**
 * 永続化エンティティからドメインモデルを抽出
 * @param entity - 永続化用のUserEntity
 * @returns ドメインモデルのUser
 */
export const fromUserEntity = (entity: UserEntity): User => {
  return {
    email: entity.email,
    passwordHash: entity.passwordHash,
    profile: entity.profile,
  };
};
