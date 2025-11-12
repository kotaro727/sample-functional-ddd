import { Result, ok, err, isErr } from '@shared/functional/result';

/**
 * UnvalidatedCustomerInfo - 未検証の顧客情報
 */
export type UnvalidatedCustomerInfo = {
  name: string;
  email: string;
  phone: string;
};

/**
 * ValidatedCustomerInfo - 検証済みの顧客情報
 * _tagフィールドでUnvalidatedと型レベルで区別
 */
export type ValidatedCustomerInfo = {
  readonly _tag: 'ValidatedCustomerInfo';
  readonly name: string;
  readonly email: string;
  readonly phone: string; // 正規化済み（ハイフンなし）
};

/**
 * CustomerInfo バリデーションエラー
 */
export type CustomerInfoValidationError =
  | { type: 'EMPTY_FIELD'; message: string }
  | { type: 'INVALID_EMAIL'; message: string }
  | { type: 'INVALID_PHONE'; message: string };

/**
 * メールアドレスのバリデーション
 * 簡易的なバリデーション（@を含む、基本的な形式）
 */
const validateEmail = (email: string): Result<string, CustomerInfoValidationError> => {
  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return err({
      type: 'INVALID_EMAIL',
      message: 'メールアドレスは空にできません',
    });
  }

  // 簡易的なメールアドレスチェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return err({
      type: 'INVALID_EMAIL',
      message: 'メールアドレスの形式が不正です',
    });
  }

  return ok(trimmed);
};

/**
 * 電話番号の正規化とバリデーション
 * - ハイフンを除去
 * - 0から始まる10桁または11桁の数字
 */
const validatePhone = (phone: string): Result<string, CustomerInfoValidationError> => {
  // ハイフンと空白を除去
  const cleaned = phone.trim().replace(/[-\s]/g, '');

  // 0から始まる10桁または11桁の数字
  if (!/^0\d{9,10}$/.test(cleaned)) {
    return err({
      type: 'INVALID_PHONE',
      message: '電話番号は0から始まる10桁または11桁の数字である必要があります（例: 09012345678）',
    });
  }

  return ok(cleaned);
};

/**
 * 文字列が空でないことを検証
 */
const validateNotEmpty = (value: string, fieldName: string): Result<string, CustomerInfoValidationError> => {
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
 * 未検証の顧客情報を検証
 */
export const validateCustomerInfo = (
  unvalidated: UnvalidatedCustomerInfo
): Result<ValidatedCustomerInfo, CustomerInfoValidationError> => {
  // 顧客名の検証
  const nameResult = validateNotEmpty(unvalidated.name, '顧客名');
  if (isErr(nameResult)) {
    return nameResult;
  }

  // メールアドレスの検証
  const emailResult = validateEmail(unvalidated.email);
  if (isErr(emailResult)) {
    return emailResult;
  }

  // 電話番号の検証と正規化
  const phoneResult = validatePhone(unvalidated.phone);
  if (isErr(phoneResult)) {
    return phoneResult;
  }

  // 全てのバリデーションが成功した場合、ValidatedCustomerInfoを構築
  return ok({
    _tag: 'ValidatedCustomerInfo',
    name: nameResult.value,
    email: emailResult.value,
    phone: phoneResult.value,
  });
};
