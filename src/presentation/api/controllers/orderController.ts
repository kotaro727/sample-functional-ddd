import type { Context } from 'hono';
import { OrderRepository } from '@application/ports/orderRepository';
import { ProductRepository } from '@application/ports/productRepository';
import { createOrder } from '@application/order/createOrder';
import { isErr } from '@shared/functional/result';
import {
  toCreateOrderRequest,
  toOrderDto,
  type CreateOrderRequestDto,
} from '@presentation/api/dto/orderDto';
import {
  handleUnknownError,
  createErrorResponse,
  parseOrderId,
} from '@presentation/api/helpers/errorHelpers';

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
        // OpenAPIで検証済みのリクエストボディを取得
        const body = (await c.req.json()) as CreateOrderRequestDto;

        // DTO → Application層の型に変換
        const requestResult = toCreateOrderRequest(body);
        if (isErr(requestResult)) {
          return createErrorResponse(c, requestResult.error);
        }

        // CreateOrderユースケースを実行
        const result = await createOrder(repository, productRepository)(requestResult.value);

        if (isErr(result)) {
          return createErrorResponse(c, result.error);
        }

        return c.json(toOrderDto(result.value), 201);
      } catch (error) {
        return handleUnknownError(c, error);
      }
    },

    /**
     * GET /orders - 注文一覧を取得
     */
    getOrders: async (c: Context): Promise<JsonResponse> => {
      try {
        const result = await repository.findAll();

        if (isErr(result)) {
          return createErrorResponse(c, result.error);
        }

        const orders = result.value.map(toOrderDto);
        return c.json({ orders }, 200);
      } catch (error) {
        return handleUnknownError(c, error);
      }
    },

    /**
     * GET /orders/:id - 注文詳細を取得
     */
    getOrderById: async (c: Context): Promise<JsonResponse> => {
      try {
        // IDパラメータをパースして検証
        const idResult = parseOrderId(c.req.param('id'));
        if (isErr(idResult)) {
          return createErrorResponse(c, idResult.error);
        }

        const result = await repository.findById(idResult.value);

        if (isErr(result)) {
          return createErrorResponse(c, result.error);
        }

        return c.json(toOrderDto(result.value), 200);
      } catch (error) {
        return handleUnknownError(c, error);
      }
    },

    /**
     * PATCH /orders/:id/status - 注文ステータスを更新
     */
    updateOrderStatus: async (c: Context): Promise<JsonResponse> => {
      try {
        // IDパラメータをパースして検証
        const idResult = parseOrderId(c.req.param('id'));
        if (isErr(idResult)) {
          return createErrorResponse(c, idResult.error);
        }

        const body = await c.req.json();
        const { shippingStatus } = body;

        // 配送ステータスのバリデーション
        if (!shippingStatus || !['PENDING', 'SHIPPED', 'DELIVERED'].includes(shippingStatus)) {
          return createErrorResponse(c, {
            type: 'INVALID_PARAMETER',
            message: '無効な配送ステータスです',
          });
        }

        const result = await repository.updateStatus(idResult.value, shippingStatus);

        if (isErr(result)) {
          return createErrorResponse(c, result.error);
        }

        return c.json(toOrderDto(result.value), 200);
      } catch (error) {
        return handleUnknownError(c, error);
      }
    },

    /**
     * DELETE /orders/:id - 注文をキャンセル
     */
    cancelOrder: async (c: Context): Promise<Response> => {
      try {
        // IDパラメータをパースして検証
        const idResult = parseOrderId(c.req.param('id'));
        if (isErr(idResult)) {
          return createErrorResponse(c, idResult.error);
        }

        const result = await repository.delete(idResult.value);

        if (isErr(result)) {
          return createErrorResponse(c, result.error);
        }

        return c.body(null, 204);
      } catch (error) {
        return handleUnknownError(c, error);
      }
    },
  };
};
