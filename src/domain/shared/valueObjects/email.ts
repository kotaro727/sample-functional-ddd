import { Result, ok, err } from '@shared/functional/result';

/**
 * Email値オブジェクト
 * イミュータブルで、バリデーションを内包する
 */
export type Email = Readonly<{
  _brand: 'Email';
  value: string;
}>;

/**
 * Emailのバリデーションエラー
 */
export type EmailError =
  | { type: 'EMPTY'; message: 'メールアドレスが空です' }
  | { type: 'INVALID_FORMAT'; message: 'メールアドレスの形式が不正です' };

/**
 * Emailの正規表現パターン
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Emailを作成（バリデーション付き）
 */
export const createEmail = (value: string): Result<Email, EmailError> => {
  // 空文字チェック
  if (value.trim() === '') {
    return err({ type: 'EMPTY', message: 'メールアドレスが空です' });
  }

  // フォーマットチェック
  if (!EMAIL_PATTERN.test(value)) {
    return err({ type: 'INVALID_FORMAT', message: 'メールアドレスの形式が不正です' });
  }

  return ok({ _brand: 'Email', value } as Email);
};

/**
 * Emailの値を取得
 */
export const getValue = (email: Email): string => email.value;

/**
 * Emailの等価性チェック
 */
export const equals = (a: Email, b: Email): boolean => a.value === b.value;
