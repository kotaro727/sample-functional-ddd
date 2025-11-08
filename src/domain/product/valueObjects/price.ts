import { Result, ok, err } from '@shared/functional/result';

/**
 * Price値オブジェクト
 * 商品の価格を表す非負の数値
 */
export type Price = Readonly<{
  _brand: 'Price';
  value: number;
}>;

/**
 * Priceのバリデーションエラー
 */
export type PriceError = {
  type: 'NEGATIVE_PRICE';
  message: '価格は0以上である必要があります';
};

/**
 * Priceを作成（バリデーション付き）
 */
export const createPrice = (value: number): Result<Price, PriceError> => {
  // 非負チェック
  if (value < 0) {
    return err({
      type: 'NEGATIVE_PRICE',
      message: '価格は0以上である必要があります',
    });
  }

  return ok({ _brand: 'Price', value } as Price);
};

/**
 * Priceの値を取得
 */
export const getValue = (price: Price): number => price.value;

/**
 * Priceの等価性チェック
 */
export const equals = (a: Price, b: Price): boolean => a.value === b.value;
