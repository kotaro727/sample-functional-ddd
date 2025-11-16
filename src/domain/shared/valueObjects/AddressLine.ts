import { Result, ok, err } from '@shared/functional/result';

/**
 * AddressLine - 町名番地を表す値オブジェクト
 */
export type AddressLine = {
  readonly _tag: 'AddressLine';
  readonly value: string;
};

/**
 * AddressLine バリデーションエラー
 */
export type AddressLineValidationError =
  | { type: 'EMPTY_ADDRESS_LINE'; message: string }
  | { type: 'ADDRESS_LINE_TOO_LONG'; message: string };

/**
 * 文字列から AddressLine を作成する
 * @param addressLine - 町名番地
 * @returns AddressLine または バリデーションエラー
 */
export const createAddressLine = (addressLine: string): Result<AddressLine, AddressLineValidationError> => {
  const trimmed = addressLine.trim();

  // 空文字列チェック
  if (trimmed.length === 0) {
    return err({
      type: 'EMPTY_ADDRESS_LINE',
      message: '町名番地は空にできません',
    });
  }

  // 長さチェック（100文字まで）
  if (trimmed.length > 100) {
    return err({
      type: 'ADDRESS_LINE_TOO_LONG',
      message: '町名番地は100文字以内である必要があります',
    });
  }

  return ok({
    _tag: 'AddressLine',
    value: trimmed,
  });
};
