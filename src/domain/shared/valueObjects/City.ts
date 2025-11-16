import { Result, ok, err } from '@shared/functional/result';

/**
 * City - 市区町村を表す値オブジェクト
 */
export type City = {
  readonly _tag: 'City';
  readonly value: string;
};

/**
 * City バリデーションエラー
 */
export type CityValidationError =
  | { type: 'EMPTY_CITY'; message: string }
  | { type: 'CITY_TOO_LONG'; message: string };

/**
 * 文字列から City を作成する
 * @param city - 市区町村名
 * @returns City または バリデーションエラー
 */
export const createCity = (city: string): Result<City, CityValidationError> => {
  const trimmed = city.trim();

  // 空文字列チェック
  if (trimmed.length === 0) {
    return err({
      type: 'EMPTY_CITY',
      message: '市区町村は空にできません',
    });
  }

  // 長さチェック（50文字まで）
  if (trimmed.length > 50) {
    return err({
      type: 'CITY_TOO_LONG',
      message: '市区町村名は50文字以内である必要があります',
    });
  }

  return ok({
    _tag: 'City',
    value: trimmed,
  });
};
