import { Result, ok, err } from '@shared/functional/result';
import * as bcrypt from 'bcrypt';

/**
 * Passwordのバリデーションエラー
 */
export type PasswordValidationError =
  | { type: 'EMPTY'; message: 'パスワードが空です' }
  | { type: 'TOO_SHORT'; message: 'パスワードは最低8文字必要です' };

/**
 * Passwordのハッシュ化エラー
 */
export type PasswordHashError = {
  type: 'HASH_FAILED';
  message: string;
};

/**
 * Passwordの検証エラー
 */
export type PasswordVerificationError = {
  type: 'VERIFICATION_FAILED';
  message: string;
};

/**
 * パスワードの最小文字数
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * bcrypt salt rounds
 */
const SALT_ROUNDS = 10;

/**
 * パスワードのバリデーション
 * 最低8文字以上であることを確認
 */
export const validatePassword = (
  password: string
): Result<string, PasswordValidationError> => {
  // 空文字チェック
  if (password.trim() === '') {
    return err({ type: 'EMPTY', message: 'パスワードが空です' });
  }

  // 最小文字数チェック
  if (password.length < MIN_PASSWORD_LENGTH) {
    return err({ type: 'TOO_SHORT', message: 'パスワードは最低8文字必要です' });
  }

  return ok(password);
};

/**
 * パスワードをハッシュ化
 * bcryptを使用してソルト付きハッシュを生成
 */
export const hashPassword = async (
  plainPassword: string
): Promise<Result<string, PasswordHashError>> => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return ok(hashedPassword);
  } catch (error) {
    return err({
      type: 'HASH_FAILED',
      message: `パスワードのハッシュ化に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

/**
 * パスワードの検証
 * 平文パスワードとハッシュ化されたパスワードを比較
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<Result<boolean, PasswordVerificationError>> => {
  try {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    return ok(isValid);
  } catch (error) {
    return err({
      type: 'VERIFICATION_FAILED',
      message: `パスワードの検証に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

