import { Result, ok, err } from '@shared/functional/result';

/**
 * ShippingStatus - 配送ステータス
 *
 * ドメインの状態遷移ルール:
 * - PENDING -> SHIPPED: 配送開始
 * - PENDING -> DELIVERED: 直接配送完了（まれなケース）
 * - SHIPPED -> DELIVERED: 配送完了
 * - 後戻りは不可（DELIVERED -> SHIPPED、SHIPPED -> PENDING など）
 * - 同じ状態への遷移は許可（冪等性）
 */
export type ShippingStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

/**
 * ShippingStatus 関連のエラー型
 */
export type ShippingStatusError = {
  type: 'INVALID_TRANSITION';
  message: string;
};

/**
 * PENDING 状態かどうかを判定
 */
export const isPending = (status: ShippingStatus): status is 'PENDING' => {
  return status === 'PENDING';
};

/**
 * SHIPPED 状態かどうかを判定
 */
export const isShipped = (status: ShippingStatus): status is 'SHIPPED' => {
  return status === 'SHIPPED';
};

/**
 * DELIVERED 状態かどうかを判定
 */
export const isDelivered = (status: ShippingStatus): status is 'DELIVERED' => {
  return status === 'DELIVERED';
};

/**
 * 状態遷移が可能かどうかを判定
 */
export const canTransitionTo = (from: ShippingStatus, to: ShippingStatus): boolean => {
  // 同じ状態への遷移は常に許可（冪等性）
  if (from === to) {
    return true;
  }

  // 許可される遷移パターン
  const allowedTransitions: Record<ShippingStatus, ShippingStatus[]> = {
    PENDING: ['SHIPPED', 'DELIVERED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [], // DELIVERED からは遷移不可
  };

  return allowedTransitions[from].includes(to);
};

/**
 * 状態を遷移させる
 *
 * @param from - 現在の状態
 * @param to - 遷移先の状態
 * @returns 遷移後の状態、または遷移不可の場合はエラー
 */
export const transitionTo = (
  from: ShippingStatus,
  to: ShippingStatus
): Result<ShippingStatus, ShippingStatusError> => {
  if (canTransitionTo(from, to)) {
    return ok(to);
  }

  return err({
    type: 'INVALID_TRANSITION',
    message: `配送ステータスを ${from} から ${to} に遷移できません`,
  });
};
