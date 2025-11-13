import type { Context } from 'hono';
import { OrderRepository } from '@application/ports/orderRepository';
import { ProductRepository } from '@application/ports/productRepository';
import { createOrder } from '@application/order/createOrder';
import { isErr } from '@shared/functional/result';
import { PersistedValidatedOrder } from '@domain/order/order';

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
 * PersistedValidatedOrderをDTO形式に変換
 */
const toOrderDto = (order: PersistedValidatedOrder) => ({
  id: order.id,
  orderItems: order.orderItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  })),
  shippingAddress: order.shippingAddress,
  customerInfo: order.customerInfo,
  shippingStatus: order.shippingStatus,
  totalAmount: order.totalAmount,
  createdAt: order.createdAt.toISOString(),
});

/**
 * OrderControllerを作成
 */
export const createOrderController = (
  repository: OrderRepository,
  productRepository: ProductRepository
): OrderController => {
  return {
    /**
     * POST /orders - 注文を作成
     */
    createOrder: async (c: Context): Promise<JsonResponse> => {
      try {
        const body = await c.req.json();

        // CreateOrderユースケースを実行
        const result = await createOrder(repository, productRepository)(body);

        if (isErr(result)) {
          const { type, message } = result.error;

          // エラータイプに応じてHTTPステータスコードを決定
          if (type === 'VALIDATION_ERROR') {
            return c.json({ error: { type, message } }, 400);
          }
          if (type === 'PRODUCT_NOT_FOUND') {
            return c.json({ error: { type, message } }, 400);
          }
          return c.json({ error: { type, message } }, 500);
        }

        return c.json(toOrderDto(result.value), 201);
      } catch (error) {
        return c.json(
          {
            error: {
              type: 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
            },
          },
          500
        );
      }
    },

    /**
     * GET /orders - 注文一覧を取得
     */
    getOrders: async (c: Context): Promise<JsonResponse> => {
      try {
        const result = await repository.findAll();

        if (isErr(result)) {
          const { type, message } = result.error;
          return c.json({ error: { type, message } }, 500);
        }

        const orders = result.value.map(toOrderDto);
        return c.json({ orders }, 200);
      } catch (error) {
        return c.json(
          {
            error: {
              type: 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
            },
          },
          500
        );
      }
    },

    /**
     * GET /orders/:id - 注文詳細を取得
     */
    getOrderById: async (c: Context): Promise<JsonResponse> => {
      try {
        const id = Number(c.req.param('id'));

        if (isNaN(id) || id < 1) {
          return c.json(
            {
              error: {
                type: 'INVALID_PARAMETER',
                message: '無効な注文IDです',
              },
            },
            400
          );
        }

        const result = await repository.findById(id);

        if (isErr(result)) {
          const { type, message } = result.error;

          if (type === 'NOT_FOUND') {
            return c.json({ error: { type, message } }, 404);
          }
          return c.json({ error: { type, message } }, 500);
        }

        return c.json(toOrderDto(result.value), 200);
      } catch (error) {
        return c.json(
          {
            error: {
              type: 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
            },
          },
          500
        );
      }
    },

    /**
     * PATCH /orders/:id/status - 注文ステータスを更新
     */
    updateOrderStatus: async (c: Context): Promise<JsonResponse> => {
      try {
        const id = Number(c.req.param('id'));
        const body = await c.req.json();
        const { shippingStatus } = body;

        if (isNaN(id) || id < 1) {
          return c.json(
            {
              error: {
                type: 'INVALID_PARAMETER',
                message: '無効な注文IDです',
              },
            },
            400
          );
        }

        if (!shippingStatus || !['PENDING', 'SHIPPED', 'DELIVERED'].includes(shippingStatus)) {
          return c.json(
            {
              error: {
                type: 'INVALID_PARAMETER',
                message: '無効な配送ステータスです',
              },
            },
            400
          );
        }

        const result = await repository.updateStatus(id, shippingStatus);

        if (isErr(result)) {
          const { type, message } = result.error;

          if (type === 'NOT_FOUND') {
            return c.json({ error: { type, message } }, 404);
          }
          if (type === 'CONFLICT') {
            return c.json({ error: { type, message } }, 409);
          }
          return c.json({ error: { type, message } }, 500);
        }

        return c.json(toOrderDto(result.value), 200);
      } catch (error) {
        return c.json(
          {
            error: {
              type: 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
            },
          },
          500
        );
      }
    },

    /**
     * DELETE /orders/:id - 注文をキャンセル
     */
    cancelOrder: async (c: Context): Promise<Response> => {
      try {
        const id = Number(c.req.param('id'));

        if (isNaN(id) || id < 1) {
          return c.json(
            {
              error: {
                type: 'INVALID_PARAMETER',
                message: '無効な注文IDです',
              },
            },
            400
          );
        }

        const result = await repository.delete(id);

        if (isErr(result)) {
          const { type, message } = result.error;

          if (type === 'NOT_FOUND') {
            return c.json({ error: { type, message } }, 404);
          }
          if (type === 'CONFLICT') {
            return c.json({ error: { type, message } }, 409);
          }
          return c.json({ error: { type, message } }, 500);
        }

        return c.body(null, 204);
      } catch (error) {
        return c.json(
          {
            error: {
              type: 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
            },
          },
          500
        );
      }
    },
  };
};
