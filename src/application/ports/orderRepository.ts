import type { Result } from '@shared/functional/result';
import type { ValidatedOrder, PersistedValidatedOrder, ShippingStatus } from '@domain/order/order';

/**
 * OrderRepository のエラー型
 */
export type OrderRepositoryError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string }
  | { type: 'CONFLICT'; message: string }; // キャンセル不可の場合など

/**
 * OrderRepository インターフェース
 * 注文の永続化を抽象化
 */
export interface OrderRepository {
  /**
   * 注文を作成
   * ValidatedOrderを受け取り、IDとタイムスタンプを付与してPersistedValidatedOrderを返す
   */
  create: (order: ValidatedOrder) => Promise<Result<PersistedValidatedOrder, OrderRepositoryError>>;

  /**
   * 全ての注文を取得
   */
  findAll: () => Promise<Result<readonly PersistedValidatedOrder[], OrderRepositoryError>>;

  /**
   * IDで注文を取得
   */
  findById: (id: number) => Promise<Result<PersistedValidatedOrder, OrderRepositoryError>>;

  /**
   * 注文のステータスを更新
   */
  updateStatus: (
    id: number,
    status: ShippingStatus
  ) => Promise<Result<PersistedValidatedOrder, OrderRepositoryError>>;

  /**
   * 注文を削除（キャンセル）
   */
  delete: (id: number) => Promise<Result<void, OrderRepositoryError>>;
}
