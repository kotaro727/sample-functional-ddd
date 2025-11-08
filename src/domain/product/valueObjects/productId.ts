import { Result, ok, err } from '@shared/functional/result';

/**
 * ProductID値オブジェクト
 * 商品を一意に識別する正の整数ID
 */
export type ProductId = Readonly<{
  _brand: 'ProductId';
  value: number;
}>;

/**
 * ProductIdのバリデーションエラー
 */
export type ProductIdError = {
  type: 'INVALID_ID';
  message: 'ProductIdは正の整数である必要があります';
};

/**
 * ProductIdを作成（バリデーション付き）
 */
export const createProductId = (value: number): Result<ProductId, ProductIdError> => {
  // 正の整数チェック
  if (value <= 0 || !Number.isInteger(value)) {
    return err({
      type: 'INVALID_ID',
      message: 'ProductIdは正の整数である必要があります',
    });
  }

  return ok({ _brand: 'ProductId', value } as ProductId);
};

/**
 * ProductIdの値を取得
 */
export const getValue = (id: ProductId): number => id.value;

/**
 * ProductIdの等価性チェック
 */
export const equals = (a: ProductId, b: ProductId): boolean => a.value === b.value;
