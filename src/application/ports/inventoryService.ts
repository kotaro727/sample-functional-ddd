import { Result } from '@shared/functional/result';

/**
 * 在庫操作エラー
 */
export type InventoryError =
  | { readonly type: 'INSUFFICIENT_STOCK'; readonly message: string }
  | { readonly type: 'PRODUCT_NOT_FOUND'; readonly message: string }
  | { readonly type: 'INVENTORY_UPDATE_ERROR'; readonly message: string };

/**
 * 在庫情報
 */
export type InventoryStock = {
  readonly productId: number;
  readonly quantity: number;
};

/**
 * 在庫サービスのポート
 *
 * 商品の在庫を管理するためのインターフェース
 */
export type InventoryService = {
  /**
   * 在庫を減らす
   *
   * @param productId - 商品ID
   * @param quantity - 減らす数量
   * @returns 成功または在庫エラー
   */
  decrease(productId: number, quantity: number): Promise<Result<void, InventoryError>>;

  /**
   * 在庫を増やす
   *
   * @param productId - 商品ID
   * @param quantity - 増やす数量
   * @returns 成功または在庫エラー
   */
  increase(productId: number, quantity: number): Promise<Result<void, InventoryError>>;

  /**
   * 在庫数を取得
   *
   * @param productId - 商品ID
   * @returns 在庫情報または在庫エラー
   */
  getStock(productId: number): Promise<Result<InventoryStock, InventoryError>>;
};
