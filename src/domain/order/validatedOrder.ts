import { Result, ok, err } from '@shared/functional/result';
import { ValidatedShippingAddress } from './shippingAddress';
import { ValidatedCustomerInfo } from './customerInfo';
import { OrderItem, calculateSubtotal } from './orderItem';
import { ShippingStatus } from './shippingStatus';

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
  readonly totalAmount: number;
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
export type ValidatedOrderCreationError = {
  type: 'EMPTY_ORDER_ITEMS';
  message: string;
};

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

  // 合計金額を計算
  const totalAmount = params.orderItems.reduce((sum, item) => sum + calculateSubtotal(item), 0);

  return ok({
    orderItems: params.orderItems,
    shippingAddress: params.shippingAddress,
    customerInfo: params.customerInfo,
    shippingStatus: 'PENDING',
    totalAmount,
  });
};

/**
 * 注文の合計金額を計算
 *
 * @param order - ValidatedOrder
 * @returns 合計金額
 */
export const calculateTotalAmount = (order: ValidatedOrder): number => {
  return order.totalAmount;
};
