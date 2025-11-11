import type { Context } from 'hono';
import { OrderRepository } from '@application/ports/orderRepository';

/**
 * OrderController
 * 注文関連のHTTPリクエストを処理
 */
type JsonResponse = ReturnType<Context['json']>;

export type OrderController = {
  createOrder: (c: Context) => Promise<JsonResponse>;
  getOrders: (c: Context) => Promise<JsonResponse>;
  getOrderById: (c: Context) => Promise<JsonResponse>;
  updateOrderStatus: (c: Context) => Promise<JsonResponse>;
  cancelOrder: (c: Context) => Promise<Response>;
};

/**
 * OrderControllerを作成
 */
export const createOrderController = (repository: OrderRepository): OrderController => {
  return {
    /**
     * POST /orders - 注文を作成
     */
    createOrder: async (c: Context): Promise<JsonResponse> => {
      // TODO: 実装予定
      // 1. リクエストボディから注文情報を取得
      // 2. UnvalidatedOrderを作成
      // 3. バリデーション（validateOrder）
      // 4. 商品の在庫チェック（ProductRepositoryと連携）
      // 5. 合計金額の計算
      // 6. Repositoryで永続化
      // 7. DTOに変換してレスポンス
      return c.json(
        {
          error: {
            type: 'NOT_IMPLEMENTED',
            message: '注文作成機能は未実装です',
          },
        },
        501
      );
    },

    /**
     * GET /orders - 注文一覧を取得
     */
    getOrders: async (c: Context): Promise<JsonResponse> => {
      // TODO: 実装予定
      // 1. Repositoryから全注文を取得
      // 2. DTOのリストに変換
      // 3. レスポンス
      return c.json(
        {
          error: {
            type: 'NOT_IMPLEMENTED',
            message: '注文一覧取得機能は未実装です',
          },
        },
        501
      );
    },

    /**
     * GET /orders/:id - 注文詳細を取得
     */
    getOrderById: async (c: Context): Promise<JsonResponse> => {
      // TODO: 実装予定
      // 1. パスパラメータからIDを取得
      // 2. IDのバリデーション
      // 3. Repositoryから注文を取得
      // 4. 見つからない場合は404
      // 5. DTOに変換してレスポンス
      return c.json(
        {
          error: {
            type: 'NOT_IMPLEMENTED',
            message: '注文詳細取得機能は未実装です',
          },
        },
        501
      );
    },

    /**
     * PATCH /orders/:id/status - 注文ステータスを更新
     */
    updateOrderStatus: async (c: Context): Promise<JsonResponse> => {
      // TODO: 実装予定
      // 1. パスパラメータからIDを取得
      // 2. リクエストボディから新しいステータスを取得
      // 3. ステータス遷移のバリデーション
      //    (例: DELIVERED -> PENDING は不可)
      // 4. Repositoryでステータス更新
      // 5. DTOに変換してレスポンス
      return c.json(
        {
          error: {
            type: 'NOT_IMPLEMENTED',
            message: '注文ステータス更新機能は未実装です',
          },
        },
        501
      );
    },

    /**
     * DELETE /orders/:id - 注文をキャンセル
     */
    cancelOrder: async (c: Context): Promise<Response> => {
      // TODO: 実装予定
      // 1. パスパラメータからIDを取得
      // 2. 注文を取得
      // 3. キャンセル可能かチェック
      //    (DELIVERED状態ならキャンセル不可 -> 409 Conflict)
      // 4. Repositoryで削除
      // 5. 204 No Content
      return c.json(
        {
          error: {
            type: 'NOT_IMPLEMENTED',
            message: '注文キャンセル機能は未実装です',
          },
        },
        501
      );
    },
  };
};
