import { Result, ok, err } from '@shared/functional/result';

/**
 * PhoneNumber - 電話番号を表す値オブジェクト
 * 常に xxx-xxxx-xxxx 形式で正規化される
 */
export type PhoneNumber = {
  readonly _tag: 'PhoneNumber';
  readonly value: string; // xxx-xxxx-xxxx 形式
};

/**
 * PhoneNumber バリデーションエラー
 */
export type PhoneNumberValidationError = {
  type: 'INVALID_PHONE';
  message: string;
};

/**
 * 文字列から PhoneNumber を作成する
 * @param phone - 電話番号（ハイフンあり・なし両方対応）
 * @returns PhoneNumber または バリデーションエラー
 */
export const createPhoneNumber = (phone: string): Result<PhoneNumber, PhoneNumberValidationError> => {
  // 空白とハイフンを除去
  const cleaned = phone.trim().replace(/[-\s]/g, '');

  // 10桁または11桁の数字かチェック
  if (!/^\d{10,11}$/.test(cleaned)) {
    return err({
      type: 'INVALID_PHONE',
      message: '電話番号は10桁または11桁の数字である必要があります（例: 09012345678 または 090-1234-5678）',
    });
  }

  // xxx-xxxx-xxxx 形式に正規化
  let normalized: string;
  if (cleaned.length === 10) {
    normalized = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  } else {
    normalized = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  return ok({
    _tag: 'PhoneNumber',
    value: normalized,
  });
};
