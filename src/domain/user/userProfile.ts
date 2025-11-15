import { Result, ok, err, isErr } from '@shared/functional/result';

/**
 * UnvalidatedUserProfile - 未検証のユーザープロフィール
 */
export type UnvalidatedUserProfile = {
  name: string;
  address: {
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine: string;
  };
  phone: string;
};

/**
 * ValidatedUserProfile - 検証済みのユーザープロフィール
 * _tagフィールドでUnvalidatedと型レベルで区別
 */
export type ValidatedUserProfile = {
  readonly _tag: 'ValidatedUserProfile';
  readonly name: string;
  readonly address: {
    readonly postalCode: string; // 正規化済み（xxx-xxxx形式）
    readonly prefecture: string;
    readonly city: string;
    readonly addressLine: string;
  };
  readonly phone: string; // 正規化済み（xxx-xxxx-xxxx形式）
};

/**
 * UserProfile バリデーションエラー
 */
export type UserProfileValidationError =
  | { type: 'INVALID_POSTAL_CODE'; message: string }
  | { type: 'INVALID_PHONE'; message: string }
  | { type: 'EMPTY_FIELD'; message: string };

/**
 * 郵便番号を正規化（ハイフンを追加）
 * @param postalCode - 郵便番号（ハイフンあり・なし両方対応）
 * @returns 正規化された郵便番号（xxx-xxxx形式）
 */
const normalizePostalCode = (postalCode: string): Result<string, UserProfileValidationError> => {
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
 * 電話番号を正規化（ハイフンを追加）
 * @param phone - 電話番号（ハイフンあり・なし両方対応）
 * @returns 正規化された電話番号（xxx-xxxx-xxxx形式）
 */
const normalizePhone = (phone: string): Result<string, UserProfileValidationError> => {
  // 空白とハイフンを除去
  const cleaned = phone.trim().replace(/[-\s]/g, '');

  // 10桁または11桁の数字かチェック
  if (!/^\d{10,11}$/.test(cleaned)) {
    return err({
      type: 'INVALID_PHONE',
      message: '電話番号は10桁または11桁の数字である必要があります（例: 09012345678 または 090-1234-5678）',
    });
  }

  // xxx-xxxx-xxxx形式に正規化
  if (cleaned.length === 10) {
    return ok(`${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`);
  } else {
    return ok(`${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`);
  }
};

/**
 * 文字列が空でないことを検証
 */
const validateNotEmpty = (value: string, fieldName: string): Result<string, UserProfileValidationError> => {
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
 * 未検証のユーザープロフィールを検証
 */
export const validateUserProfile = (
  unvalidated: UnvalidatedUserProfile
): Result<ValidatedUserProfile, UserProfileValidationError> => {
  // 名前の検証
  const nameResult = validateNotEmpty(unvalidated.name, '名前');
  if (isErr(nameResult)) {
    return nameResult;
  }

  // 郵便番号の検証と正規化
  const postalCodeResult = normalizePostalCode(unvalidated.address.postalCode);
  if (isErr(postalCodeResult)) {
    return postalCodeResult;
  }

  // 都道府県の検証
  const prefectureResult = validateNotEmpty(unvalidated.address.prefecture, '都道府県');
  if (isErr(prefectureResult)) {
    return prefectureResult;
  }

  // 市区町村の検証
  const cityResult = validateNotEmpty(unvalidated.address.city, '市区町村');
  if (isErr(cityResult)) {
    return cityResult;
  }

  // 町名番地の検証
  const addressLineResult = validateNotEmpty(unvalidated.address.addressLine, '町名番地');
  if (isErr(addressLineResult)) {
    return addressLineResult;
  }

  // 電話番号の検証と正規化
  const phoneResult = normalizePhone(unvalidated.phone);
  if (isErr(phoneResult)) {
    return phoneResult;
  }

  // 全てのバリデーションが成功した場合、ValidatedUserProfileを構築
  return ok({
    _tag: 'ValidatedUserProfile',
    name: nameResult.value,
    address: {
      postalCode: postalCodeResult.value,
      prefecture: prefectureResult.value,
      city: cityResult.value,
      addressLine: addressLineResult.value,
    },
    phone: phoneResult.value,
  });
};

