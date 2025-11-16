import { Result, ok, err } from '@shared/functional/result';

/**
 * PersonName - 人名を表す値オブジェクト
 */
export type PersonName = {
  readonly _tag: 'PersonName';
  readonly value: string;
};

/**
 * PersonName バリデーションエラー
 */
export type PersonNameValidationError =
  | { type: 'EMPTY_NAME'; message: string }
  | { type: 'NAME_TOO_LONG'; message: string };

/**
 * 文字列から PersonName を作成する
 * @param name - 人名
 * @returns PersonName または バリデーションエラー
 */
export const createPersonName = (name: string): Result<PersonName, PersonNameValidationError> => {
  const trimmed = name.trim();

  // 空文字列チェック
  if (trimmed.length === 0) {
    return err({
      type: 'EMPTY_NAME',
      message: '名前は空にできません',
    });
  }

  // 長さチェック（100文字まで）
  if (trimmed.length > 100) {
    return err({
      type: 'NAME_TOO_LONG',
      message: '名前は100文字以内である必要があります',
    });
  }

  return ok({
    _tag: 'PersonName',
    value: trimmed,
  });
};
