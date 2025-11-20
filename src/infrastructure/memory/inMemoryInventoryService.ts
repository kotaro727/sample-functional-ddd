import {
  InventoryService,
  InventoryError,
  InventoryStock,
} from '@application/ports/inventoryService';
import { Result, ok, err } from '@shared/functional/result';

/**
 * インメモリ在庫サービスの実装
 *
 * メモリ内で商品の在庫を管理します。
 * 本番環境では、データベースを使用した実装に置き換えてください。
 */
export class InMemoryInventoryService implements InventoryService {
  private stock: Map<number, number>;

  /**
   * @param initialStock - 初期在庫（商品IDをキー、数量を値とするオブジェクト）
   */
  constructor(initialStock: Record<number, number> = {}) {
    this.stock = new Map(Object.entries(initialStock).map(([id, qty]) => [Number(id), qty]));
  }

  /**
   * 在庫を減らす
   */
  async decrease(productId: number, quantity: number): Promise<Result<void, InventoryError>> {
    const currentStock = this.stock.get(productId);

    // 商品が存在しない場合
    if (currentStock === undefined) {
      return err({
        type: 'PRODUCT_NOT_FOUND',
        message: `商品ID ${productId} が見つかりません`,
      });
    }

    // 在庫不足の場合
    if (currentStock < quantity) {
      return err({
        type: 'INSUFFICIENT_STOCK',
        message: `商品ID ${productId} の在庫が不足しています（現在: ${currentStock}, 必要: ${quantity}）`,
      });
    }

    // 在庫を減らす
    this.stock.set(productId, currentStock - quantity);
    return ok(undefined);
  }

  /**
   * 在庫を増やす
   */
  async increase(productId: number, quantity: number): Promise<Result<void, InventoryError>> {
    const currentStock = this.stock.get(productId);

    // 商品が存在しない場合
    if (currentStock === undefined) {
      return err({
        type: 'PRODUCT_NOT_FOUND',
        message: `商品ID ${productId} が見つかりません`,
      });
    }

    // 在庫を増やす
    this.stock.set(productId, currentStock + quantity);
    return ok(undefined);
  }

  /**
   * 在庫数を取得
   */
  async getStock(productId: number): Promise<Result<InventoryStock, InventoryError>> {
    const quantity = this.stock.get(productId);

    // 商品が存在しない場合
    if (quantity === undefined) {
      return err({
        type: 'PRODUCT_NOT_FOUND',
        message: `商品ID ${productId} が見つかりません`,
      });
    }

    return ok({
      productId,
      quantity,
    });
  }
}
