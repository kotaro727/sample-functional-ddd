import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { ProductRepository } from '@application/ports/productRepository';
import { createProductController } from '@presentation/api/controllers/productController';

const productDtoSchema = z
  .object({
    id: z.number().int().min(1).openapi({ example: 1, description: '商品ID' }),
    title: z.string().min(1).openapi({ example: 'iPhone 15', description: '商品名' }),
    price: z.number().nonnegative().openapi({ example: 999.99, description: '価格' }),
    description: z.string().nullable().optional().openapi({ example: '最新のiPhone', description: '商品説明' }),
  })
  .openapi('ProductDto');

const errorResponseSchema = z
  .object({
    error: z.object({
      type: z.string().openapi({ example: 'NOT_FOUND' }),
      message: z.string().openapi({ example: '商品が見つかりません' }),
    }),
  })
  .openapi('ErrorResponse');

const productListSchema = z.object({
  products: z.array(productDtoSchema),
});

const productIdParamsSchema = z.object({
  id: z
    .coerce.number()
    .int()
    .min(1)
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
        description: '商品ID',
      },
      example: 1,
    }),
});

const getProductsRoute = createRoute({
  method: 'get',
  path: '/products',
  tags: ['products'],
  responses: {
    200: {
      description: '商品一覧の取得に成功',
      content: {
        'application/json': {
          schema: productListSchema,
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

const getProductByIdRoute = createRoute({
  method: 'get',
  path: '/products/{id}',
  tags: ['products'],
  request: {
    params: productIdParamsSchema,
  },
  responses: {
    200: {
      description: '商品詳細の取得に成功',
      content: {
        'application/json': {
          schema: productDtoSchema,
        },
      },
    },
    404: {
      description: '商品が見つからない',
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
 * 商品関連のルーティングを作成
 */
export const createProductRoutes = (repository: ProductRepository) => {
  const router = new OpenAPIHono();
  const controller = createProductController(repository);

  router.openapi(getProductsRoute, controller.getProducts);
  router.openapi(getProductByIdRoute, controller.getProductById);

  return router;
};
