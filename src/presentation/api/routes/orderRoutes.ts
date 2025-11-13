import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { OrderRepository } from '@application/ports/orderRepository';
import { ProductRepository } from '@application/ports/productRepository';
import { createOrderController } from '@presentation/api/controllers/orderController';

// 共通エラーレスポンススキーマ
const errorResponseSchema = z
  .object({
    error: z.object({
      type: z.string().openapi({ example: 'NOT_FOUND' }),
      message: z.string().openapi({ example: '注文が見つかりません' }),
    }),
  })
  .openapi('ErrorResponse');

// OrderItemDto - 注文明細
const orderItemDtoSchema = z
  .object({
    productId: z.number().int().min(1).openapi({ example: 1, description: '商品ID' }),
    quantity: z.number().int().min(1).openapi({ example: 2, description: '数量' }),
  })
  .openapi('OrderItemDto');

// UnvalidatedShippingAddressDto - 未検証の配送先住所
const unvalidatedShippingAddressDtoSchema = z
  .object({
    postalCode: z.string().openapi({
      example: '123-4567',
      description: '郵便番号',
    }),
    prefecture: z.string().openapi({ example: '東京都', description: '都道府県' }),
    city: z.string().openapi({ example: '渋谷区', description: '市区町村' }),
    addressLine: z.string().openapi({
      example: '神南1-2-3',
      description: '町名番地',
    }),
  })
  .openapi('UnvalidatedShippingAddressDto');

// ValidatedShippingAddressDto - 検証済みの配送先住所
const validatedShippingAddressDtoSchema = z
  .object({
    _tag: z.literal('ValidatedShippingAddress').openapi({ description: '検証済み識別子' }),
    postalCode: z
      .string()
      .regex(/^\d{3}-\d{4}$/)
      .openapi({
        example: '123-4567',
        description: '郵便番号（ハイフン付き、検証済み）',
      }),
    prefecture: z.string().min(1).openapi({ example: '東京都', description: '都道府県' }),
    city: z.string().min(1).openapi({ example: '渋谷区', description: '市区町村' }),
    addressLine: z.string().min(1).openapi({
      example: '神南1-2-3',
      description: '町名番地',
    }),
  })
  .openapi('ValidatedShippingAddressDto');

// UnvalidatedCustomerInfoDto - 未検証の顧客情報
const unvalidatedCustomerInfoDtoSchema = z
  .object({
    name: z.string().openapi({ example: '山田太郎', description: '顧客名' }),
    email: z.string().openapi({
      example: 'yamada@example.com',
      description: 'メールアドレス',
    }),
    phone: z.string().openapi({
      example: '09012345678',
      description: '電話番号',
    }),
  })
  .openapi('UnvalidatedCustomerInfoDto');

// ValidatedCustomerInfoDto - 検証済みの顧客情報
const validatedCustomerInfoDtoSchema = z
  .object({
    _tag: z.literal('ValidatedCustomerInfo').openapi({ description: '検証済み識別子' }),
    name: z.string().min(1).openapi({ example: '山田太郎', description: '顧客名（検証済み）' }),
    email: z.string().email().openapi({
      example: 'yamada@example.com',
      description: 'メールアドレス（検証済み）',
    }),
    phone: z
      .string()
      .regex(/^0\d{9,10}$/)
      .openapi({
        example: '09012345678',
        description: '電話番号（ハイフンなし、検証済み）',
      }),
  })
  .openapi('ValidatedCustomerInfoDto');

// ShippingStatus - 配送ステータス
const shippingStatusSchema = z.enum(['PENDING', 'SHIPPED', 'DELIVERED']).openapi({
  description: '配送ステータス（PENDING: 未配送, SHIPPED: 配送中, DELIVERED: 配送済み）',
  example: 'PENDING',
});

// OrderDto - 注文（レスポンス用）- 検証済みのデータを含む
const orderDtoSchema = z
  .object({
    id: z.number().int().min(1).openapi({ example: 1, description: '注文ID' }),
    orderItems: z.array(orderItemDtoSchema).min(1).openapi({
      description: '注文明細（最低1つ必要）',
    }),
    shippingAddress: validatedShippingAddressDtoSchema,
    customerInfo: validatedCustomerInfoDtoSchema,
    shippingStatus: shippingStatusSchema,
    totalAmount: z.number().nonnegative().openapi({
      example: 1999.98,
      description: '合計金額',
    }),
    createdAt: z.string().datetime().openapi({
      example: '2025-01-11T10:00:00Z',
      description: '注文作成日時（ISO 8601形式）',
    }),
  })
  .openapi('OrderDto');

// CreateOrderRequest - 注文作成リクエスト - 未検証のデータを受け取る
const createOrderRequestSchema = z
  .object({
    orderItems: z.array(orderItemDtoSchema).min(1).openapi({
      description: '注文明細（最低1つ必要）',
    }),
    shippingAddress: unvalidatedShippingAddressDtoSchema,
    customerInfo: unvalidatedCustomerInfoDtoSchema,
  })
  .openapi('CreateOrderRequest');

// UpdateOrderStatusRequest - 注文ステータス更新リクエスト
const updateOrderStatusRequestSchema = z
  .object({
    shippingStatus: shippingStatusSchema,
  })
  .openapi('UpdateOrderStatusRequest');

// OrderListResponse - 注文一覧レスポンス
const orderListSchema = z.object({
  orders: z.array(orderDtoSchema),
});

// パスパラメータスキーマ
const orderIdParamsSchema = z.object({
  id: z.coerce.number().int().min(1).openapi({
    param: {
      name: 'id',
      in: 'path',
      required: true,
      description: '注文ID',
    },
    example: 1,
  }),
});

// POST /orders - 注文作成
const createOrderRoute = createRoute({
  method: 'post',
  path: '/orders',
  tags: ['orders'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createOrderRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: '注文作成成功',
      content: {
        'application/json': {
          schema: orderDtoSchema,
        },
      },
    },
    400: {
      description: 'バリデーションエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// GET /orders - 注文一覧取得
const getOrdersRoute = createRoute({
  method: 'get',
  path: '/orders',
  tags: ['orders'],
  responses: {
    200: {
      description: '注文一覧取得成功',
      content: {
        'application/json': {
          schema: orderListSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// GET /orders/:id - 注文詳細取得
const getOrderByIdRoute = createRoute({
  method: 'get',
  path: '/orders/{id}',
  tags: ['orders'],
  request: {
    params: orderIdParamsSchema,
  },
  responses: {
    200: {
      description: '注文詳細取得成功',
      content: {
        'application/json': {
          schema: orderDtoSchema,
        },
      },
    },
    404: {
      description: '注文が見つからない',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// PATCH /orders/:id/status - 注文ステータス更新
const updateOrderStatusRoute = createRoute({
  method: 'patch',
  path: '/orders/{id}/status',
  tags: ['orders'],
  request: {
    params: orderIdParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: updateOrderStatusRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: '注文ステータス更新成功',
      content: {
        'application/json': {
          schema: orderDtoSchema,
        },
      },
    },
    400: {
      description: 'バリデーションエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: '注文が見つからない',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// DELETE /orders/:id - 注文キャンセル
const cancelOrderRoute = createRoute({
  method: 'delete',
  path: '/orders/{id}',
  tags: ['orders'],
  request: {
    params: orderIdParamsSchema,
  },
  responses: {
    204: {
      description: '注文キャンセル成功',
    },
    404: {
      description: '注文が見つからない',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description: '既に配送済みのためキャンセル不可',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

/**
 * 注文関連のルーティングを作成
 */
export const createOrderRoutes = (
  repository: OrderRepository,
  productRepository: ProductRepository
) => {
  const router = new OpenAPIHono();
  const controller = createOrderController(repository, productRepository);

  router.openapi(createOrderRoute, controller.createOrder);
  router.openapi(getOrdersRoute, controller.getOrders);
  router.openapi(getOrderByIdRoute, controller.getOrderById);
  router.openapi(updateOrderStatusRoute, controller.updateOrderStatus);
  router.openapi(cancelOrderRoute, controller.cancelOrder);

  return router;
};
