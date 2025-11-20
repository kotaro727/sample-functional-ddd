import { InventoryService } from '@application/ports/inventoryService';
import { OrderCreatedEvent } from '@domain/order/events';
import { isErr } from '@shared/functional/result';

/**
 * 注文作成時に在庫を減らすイベントハンドラー
 *
 * OrderCreatedEventを受け取り、注文された商品の在庫を減らします。
 * 在庫減少に失敗した場合はエラーログを出力しますが、
 * 注文処理自体は成功として扱います（補償トランザクションで対応）。
 *
 * @param inventoryService - 在庫サービス
 * @returns イベントハンドラー関数
 */
export const decreaseInventory =
  (inventoryService: InventoryService) =>
  async (event: OrderCreatedEvent): Promise<void> => {
    const { orderItems } = event.payload;

    // 各注文明細の商品在庫を減らす
    for (const item of orderItems) {
      const result = await inventoryService.decrease(item.productId, item.quantity);

      if (isErr(result)) {
        // 在庫減少失敗はログに記録
        console.error(
          `在庫減少に失敗しました: 商品ID ${item.productId}, 数量 ${item.quantity}`,
          result.error.message
        );
        // TODO: 補償トランザクション（例: 注文をキャンセル、管理者に通知など）
      } else {
        console.log(`在庫を減らしました: 商品ID ${item.productId}, 数量 ${item.quantity}`);
      }
    }
  };
