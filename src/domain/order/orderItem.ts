import { Result, ok, err } from '@shared/functional/result';

/**
 * OrderItem - 注文明細
 * 商品ID、数量、単価を持つ
 */
export type OrderItem = {
  readonly productId: number;
  readonly quantity: number;
  readonly unitPrice: number;
};

/**
 * OrderItem バリデーションエラー
 */
export type OrderItemValidationError =
  | { type: 'INVALID_PRODUCT_ID'; message: string }
  | { type: 'INVALID_QUANTITY'; message: string }
  | { type: 'INVALID_PRICE'; message: string };

/**
 * 注文明細を作成
 *
 * ビジネスルール:
 * - 商品IDは1以上の整数
 * - 数量は1以上999以下（カート上限）
 * - 単価は0以上（無料商品も許可）
 *
 * @param productId - 商品ID
 * @param quantity - 数量
 * @param unitPrice - 単価
 * @returns OrderItemまたはバリデーションエラー
 */
export const createOrderItem = (
  productId: number,
  quantity: number,
  unitPrice: number
): Result<OrderItem, OrderItemValidationError> => {
  // 商品IDの検証
  if (productId < 1 || !Number.isInteger(productId)) {
    return err({
      type: 'INVALID_PRODUCT_ID',
      message: '商品IDは1以上の整数である必要があります',
    });
  }

  // 数量の検証
  if (quantity < 1 || !Number.isInteger(quantity)) {
    return err({
      type: 'INVALID_QUANTITY',
      message: '数量は1以上の整数である必要があります',
    });
  }

  if (quantity > 999) {
    return err({
      type: 'INVALID_QUANTITY',
      message: '数量は999以下である必要があります',
    });
  }

  // 単価の検証
  if (unitPrice < 0) {
    return err({
      type: 'INVALID_PRICE',
      message: '単価は0以上である必要があります',
    });
  }

  return ok({
    productId,
    quantity,
    unitPrice,
  });
};

/**
 * 注文明細の小計を計算
 *
 * @param item - 注文明細
 * @returns 小計金額（quantity * unitPrice）
 */
export const calculateSubtotal = (item: OrderItem): number => {
  return item.quantity * item.unitPrice;
};
