import { Result, ok, err } from '@shared/functional/result';

/**
 * Money - 金額を表す値オブジェクト
 *
 * ビジネスルール:
 * - 金額は0以上の整数
 * - 通貨単位は円（JPY）
 * - イミュータブル
 */
export type Money = {
  readonly _brand: 'Money';
  readonly value: number;
};

/**
 * Moneyエラー型
 */
export type MoneyError =
  | { type: 'NEGATIVE_AMOUNT'; message: string }
  | { type: 'NON_INTEGER_AMOUNT'; message: string }
  | { type: 'NEGATIVE_MULTIPLIER'; message: string }
  | { type: 'NON_INTEGER_MULTIPLIER'; message: string };

/**
 * Moneyを作成
 *
 * @param amount - 金額（0以上の整数）
 * @returns MoneyまたはMoneyError
 */
export const createMoney = (amount: number): Result<Money, MoneyError> => {
  // 負の金額チェック
  if (amount < 0) {
    return err({
      type: 'NEGATIVE_AMOUNT',
      message: '金額は0以上である必要があります',
    });
  }

  // 整数チェック
  if (!Number.isInteger(amount)) {
    return err({
      type: 'NON_INTEGER_AMOUNT',
      message: '金額は整数である必要があります',
    });
  }

  return ok({
    _brand: 'Money',
    value: amount,
  });
};

/**
 * Moneyの金額を取得
 *
 * @param money - Money値オブジェクト
 * @returns 金額
 */
export const getMoney = (money: Money): number => {
  return money.value;
};

/**
 * 2つのMoneyを加算
 *
 * @param a - Money
 * @param b - Money
 * @returns 加算結果のMoney
 */
export const addMoney = (a: Money, b: Money): Money => {
  // すでに検証済みのMoneyなので、createMoneyを通さず直接作成できる
  return {
    _brand: 'Money',
    value: a.value + b.value,
  };
};

/**
 * Moneyを整数で乗算
 *
 * @param money - Money
 * @param multiplier - 乗数（0以上の整数）
 * @returns 乗算結果のMoneyまたはMoneyError
 */
export const multiplyMoney = (
  money: Money,
  multiplier: number
): Result<Money, MoneyError> => {
  // 負の数チェック
  if (multiplier < 0) {
    return err({
      type: 'NEGATIVE_MULTIPLIER',
      message: '乗数は0以上である必要があります',
    });
  }

  // 整数チェック
  if (!Number.isInteger(multiplier)) {
    return err({
      type: 'NON_INTEGER_MULTIPLIER',
      message: '乗数は整数である必要があります',
    });
  }

  return ok({
    _brand: 'Money',
    value: money.value * multiplier,
  });
};
