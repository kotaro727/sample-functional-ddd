import { Result, ok, err, isErr } from '@shared/functional/result';

/**
 * UnvalidatedShippingAddress - 未検証の配送先住所
 */
export type UnvalidatedShippingAddress = {
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
};

/**
 * ValidatedShippingAddress - 検証済みの配送先住所
 * _tagフィールドでUnvalidatedと型レベルで区別
 */
export type ValidatedShippingAddress = {
  readonly _tag: 'ValidatedShippingAddress';
  readonly postalCode: string; // 正規化済み（xxx-xxxx形式）
  readonly prefecture: string;
  readonly city: string;
  readonly addressLine: string;
};

/**
 * ShippingAddress バリデーションエラー
 */
export type ShippingAddressValidationError =
  | { type: 'INVALID_POSTAL_CODE'; message: string }
  | { type: 'EMPTY_FIELD'; message: string };

/**
 * 郵便番号を正規化（ハイフンを追加）
 * @param postalCode - 郵便番号（ハイフンあり・なし両方対応）
 * @returns 正規化された郵便番号（xxx-xxxx形式）
 */
const normalizePostalCode = (postalCode: string): Result<string, ShippingAddressValidationError> => {
  // 空白を除去
  const cleaned = postalCode.trim().replace(/[-\s]/g, '');

  // 7桁の数字かチェック
  if (!/^\d{7}$/.test(cleaned)) {
    return err({
      type: 'INVALID_POSTAL_CODE',
      message: '郵便番号は7桁の数字である必要があります（例: 1234567 または 123-4567）',
    });
  }

  // xxx-xxxx形式に正規化
  return ok(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
};

/**
 * 文字列が空でないことを検証
 */
const validateNotEmpty = (value: string, fieldName: string): Result<string, ShippingAddressValidationError> => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return err({
      type: 'EMPTY_FIELD',
      message: `${fieldName}は空にできません`,
    });
  }
  return ok(trimmed);
};

/**
 * 未検証の配送先住所を検証
 */
export const validateShippingAddress = (
  unvalidated: UnvalidatedShippingAddress
): Result<ValidatedShippingAddress, ShippingAddressValidationError> => {
  // 郵便番号の検証と正規化
  const postalCodeResult = normalizePostalCode(unvalidated.postalCode);
  if (isErr(postalCodeResult)) {
    return postalCodeResult;
  }

  // 都道府県の検証
  const prefectureResult = validateNotEmpty(unvalidated.prefecture, '都道府県');
  if (isErr(prefectureResult)) {
    return prefectureResult;
  }

  // 市区町村の検証
  const cityResult = validateNotEmpty(unvalidated.city, '市区町村');
  if (isErr(cityResult)) {
    return cityResult;
  }

  // 町名番地の検証
  const addressLineResult = validateNotEmpty(unvalidated.addressLine, '町名番地');
  if (isErr(addressLineResult)) {
    return addressLineResult;
  }

  // 全てのバリデーションが成功した場合、ValidatedShippingAddressを構築
  return ok({
    _tag: 'ValidatedShippingAddress',
    postalCode: postalCodeResult.value,
    prefecture: prefectureResult.value,
    city: cityResult.value,
    addressLine: addressLineResult.value,
  });
};
