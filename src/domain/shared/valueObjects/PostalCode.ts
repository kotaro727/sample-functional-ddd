import { Result, ok, err } from '@shared/functional/result';

/**
 * PostalCode - 郵便番号を表す値オブジェクト
 * 常に xxx-xxxx 形式で正規化される
 */
export type PostalCode = {
  readonly _tag: 'PostalCode';
  readonly value: string; // xxx-xxxx 形式
};

/**
 * PostalCode バリデーションエラー
 */
export type PostalCodeValidationError = {
  type: 'INVALID_POSTAL_CODE';
  message: string;
};

/**
 * 文字列から PostalCode を作成する
 * @param postalCode - 郵便番号（ハイフンあり・なし両方対応）
 * @returns PostalCode または バリデーションエラー
 */
export const createPostalCode = (postalCode: string): Result<PostalCode, PostalCodeValidationError> => {
  // 空白とハイフンを除去
  const cleaned = postalCode.trim().replace(/[-\s]/g, '');

  // 7桁の数字かチェック
  if (!/^\d{7}$/.test(cleaned)) {
    return err({
      type: 'INVALID_POSTAL_CODE',
      message: '郵便番号は7桁の数字である必要があります（例: 1234567 または 123-4567）',
    });
  }

  // xxx-xxxx 形式に正規化
  const normalized = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;

  return ok({
    _tag: 'PostalCode',
    value: normalized,
  });
};
