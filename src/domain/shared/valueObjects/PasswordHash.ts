import { Result, ok, err } from '@shared/functional/result';

/**
 * PasswordHash - bcryptでハッシュ化されたパスワードを表す値オブジェクト
 */
export type PasswordHash = {
  readonly _tag: 'PasswordHash';
  readonly value: string;
};

/**
 * PasswordHash バリデーションエラー
 */
export type PasswordHashValidationError =
  | { type: 'EMPTY_PASSWORD_HASH'; message: string }
  | { type: 'INVALID_PASSWORD_HASH_FORMAT'; message: string };

/**
 * bcryptハッシュの正規表現
 * $2a$, $2b$, $2x$, $2y$ のいずれかで始まり、
 * ラウンド数（04-31）が続き、その後53文字のハッシュ値が続く
 */
const BCRYPT_HASH_REGEX = /^\$2[abxy]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$/;

/**
 * 文字列から PasswordHash を作成する
 * @param hash - bcryptでハッシュ化されたパスワード
 * @returns PasswordHash または バリデーションエラー
 */
export const createPasswordHash = (hash: string): Result<PasswordHash, PasswordHashValidationError> => {
  // 空文字列チェック
  if (hash.length === 0) {
    return err({
      type: 'EMPTY_PASSWORD_HASH',
      message: 'パスワードハッシュは空にできません',
    });
  }

  // bcryptハッシュ形式チェック
  if (!BCRYPT_HASH_REGEX.test(hash)) {
    return err({
      type: 'INVALID_PASSWORD_HASH_FORMAT',
      message: 'パスワードハッシュはbcrypt形式である必要があります（例: $2a$10$...）',
    });
  }

  return ok({
    _tag: 'PasswordHash',
    value: hash,
  });
};
