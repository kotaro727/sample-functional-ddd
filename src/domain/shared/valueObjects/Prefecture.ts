import { Result, ok, err } from '@shared/functional/result';

/**
 * Prefecture - 都道府県を表す値オブジェクト
 */
export type Prefecture = {
  readonly _tag: 'Prefecture';
  readonly value: string;
};

/**
 * Prefecture バリデーションエラー
 */
export type PrefectureValidationError =
  | { type: 'EMPTY_PREFECTURE'; message: string }
  | { type: 'PREFECTURE_TOO_LONG'; message: string };

/**
 * 文字列から Prefecture を作成する
 * @param prefecture - 都道府県名
 * @returns Prefecture または バリデーションエラー
 */
export const createPrefecture = (prefecture: string): Result<Prefecture, PrefectureValidationError> => {
  const trimmed = prefecture.trim();

  // 空文字列チェック
  if (trimmed.length === 0) {
    return err({
      type: 'EMPTY_PREFECTURE',
      message: '都道府県は空にできません',
    });
  }

  // 長さチェック（10文字まで）
  if (trimmed.length > 10) {
    return err({
      type: 'PREFECTURE_TOO_LONG',
      message: '都道府県名は10文字以内である必要があります',
    });
  }

  return ok({
    _tag: 'Prefecture',
    value: trimmed,
  });
};
