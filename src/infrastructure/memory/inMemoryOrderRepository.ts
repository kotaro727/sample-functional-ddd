import { OrderRepository, OrderRepositoryError } from '@application/ports/orderRepository';
import { ValidatedOrder } from '@domain/order/order';
import { Result, ok, err } from '@shared/functional/result';

/**
 * インメモリOrderRepository
 * 開発・テスト用のモック実装
 */
export const createInMemoryOrderRepository = (): OrderRepository => {
  // メモリ上の注文データストア
  const orders: Map<number, ValidatedOrder> = new Map();
  let nextId = 1;

  return {
    /**
     * 注文を作成
     */
    create: async (order: ValidatedOrder): Promise<Result<ValidatedOrder, OrderRepositoryError>> => {
      try {
        const newOrder: ValidatedOrder = {
          ...order,
          id: nextId++,
          createdAt: new Date(),
        };
        orders.set(newOrder.id, newOrder);
        return ok(newOrder);
      } catch (error) {
        return err({
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : '注文の作成に失敗しました',
        });
      }
    },

    /**
     * 全ての注文を取得
     */
    findAll: async (): Promise<Result<readonly ValidatedOrder[], OrderRepositoryError>> => {
      try {
        const allOrders = Array.from(orders.values());
        return ok(allOrders as readonly ValidatedOrder[]);
      } catch (error) {
        return err({
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : '注文一覧の取得に失敗しました',
        });
      }
    },

    /**
     * IDで注文を取得
     */
    findById: async (id: number): Promise<Result<ValidatedOrder, OrderRepositoryError>> => {
      try {
        const order = orders.get(id);
        if (!order) {
          return err({
            type: 'NOT_FOUND',
            message: `注文ID ${id} が見つかりません`,
          });
        }
        return ok(order);
      } catch (error) {
        return err({
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : '注文の取得に失敗しました',
        });
      }
    },

    /**
     * 注文のステータスを更新
     */
    updateStatus: async (
      id: number,
      status: 'PENDING' | 'SHIPPED' | 'DELIVERED'
    ): Promise<Result<ValidatedOrder, OrderRepositoryError>> => {
      try {
        const order = orders.get(id);
        if (!order) {
          return err({
            type: 'NOT_FOUND',
            message: `注文ID ${id} が見つかりません`,
          });
        }

        const updatedOrder: ValidatedOrder = {
          ...order,
          shippingStatus: status,
        };
        orders.set(id, updatedOrder);
        return ok(updatedOrder);
      } catch (error) {
        return err({
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'ステータス更新に失敗しました',
        });
      }
    },

    /**
     * 注文を削除（キャンセル）
     */
    delete: async (id: number): Promise<Result<void, OrderRepositoryError>> => {
      try {
        const order = orders.get(id);
        if (!order) {
          return err({
            type: 'NOT_FOUND',
            message: `注文ID ${id} が見つかりません`,
          });
        }

        // 配送済みの場合はキャンセル不可
        if (order.shippingStatus === 'DELIVERED') {
          return err({
            type: 'CONFLICT',
            message: '配送済みの注文はキャンセルできません',
          });
        }

        orders.delete(id);
        return ok(undefined);
      } catch (error) {
        return err({
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : '注文のキャンセルに失敗しました',
        });
      }
    },
  };
};
