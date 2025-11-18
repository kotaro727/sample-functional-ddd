import { Result, ok, err } from '@shared/functional/result';
import { ValidatedShippingAddress } from './shippingAddress';
import { ValidatedCustomerInfo } from './customerInfo';
import { OrderItem, calculateSubtotal } from './orderItem';
import { ShippingStatus } from './shippingStatus';
import { Money, addMoney, createMoney } from '@domain/shared/valueObjects/money';
import { isOk } from '@shared/functional/result';

/**
 * ValidatedOrder - 検証済み注文エンティティ
 *
 * ドメインの不変条件:
 * - 1つ以上の注文明細を持つ
 * - 検証済みの配送先住所を持つ
 * - 検証済みの顧客情報を持つ
 * - 配送ステータスを持つ
 * - 合計金額は全OrderItemの小計の合計と一致する
 */
export type ValidatedOrder = {
  readonly orderItems: readonly OrderItem[];
  readonly shippingAddress: ValidatedShippingAddress;
  readonly customerInfo: ValidatedCustomerInfo;
  readonly shippingStatus: ShippingStatus;
  readonly totalAmount: Money;
};

/**
 * 永続化済みValidatedOrder（IDとタイムスタンプを持つ）
 * Repositoryから取得したOrderはこの型になる
 */
export type PersistedValidatedOrder = ValidatedOrder & {
  readonly id: number;
  readonly createdAt: Date;
};

/**
 * ValidatedOrder 作成エラー
 */
export type ValidatedOrderCreationError =
  | { type: 'EMPTY_ORDER_ITEMS'; message: string }
  | { type: 'CALCULATION_ERROR'; message: string };

/**
 * ValidatedOrderを作成するためのパラメータ
 */
export type CreateValidatedOrderParams = {
  orderItems: readonly OrderItem[];
  shippingAddress: ValidatedShippingAddress;
  customerInfo: ValidatedCustomerInfo;
};

/**
 * 検証済み注文を作成
 *
 * ビジネスルール:
 * - 注文明細は最低1つ必要
 * - 合計金額は全OrderItemの小計の合計
 * - 初期ステータスはPENDING
 *
 * @param params - 注文作成パラメータ
 * @returns ValidatedOrderまたはエラー
 */
export const createValidatedOrder = (
  params: CreateValidatedOrderParams
): Result<ValidatedOrder, ValidatedOrderCreationError> => {
  // 注文明細が1つ以上あることを確認
  if (params.orderItems.length === 0) {
    return err({
      type: 'EMPTY_ORDER_ITEMS',
      message: '注文明細は1つ以上必要です',
    });
  }

  // 合計金額を計算（0円から開始）
  const zeroMoneyResult = createMoney(0);
  if (!isOk(zeroMoneyResult)) {
    return err({
      type: 'CALCULATION_ERROR',
      message: '初期金額の作成に失敗しました',
    });
  }

  let totalAmount = zeroMoneyResult.value;

  // 各OrderItemの小計を合計
  for (const item of params.orderItems) {
    const subtotalResult = calculateSubtotal(item);
    if (!isOk(subtotalResult)) {
      return err({
        type: 'CALCULATION_ERROR',
        message: subtotalResult.error.message,
      });
    }
    totalAmount = addMoney(totalAmount, subtotalResult.value);
  }

  return ok({
    orderItems: params.orderItems,
    shippingAddress: params.shippingAddress,
    customerInfo: params.customerInfo,
    shippingStatus: 'PENDING',
    totalAmount,
  });
};

/**
 * 注文の合計金額を取得
 *
 * @param order - ValidatedOrder
 * @returns 合計金額（Money値オブジェクト）
 */
export const calculateTotalAmount = (order: ValidatedOrder): Money => {
  return order.totalAmount;
};
