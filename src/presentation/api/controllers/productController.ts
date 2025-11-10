import type { Context } from 'hono';
import { ProductRepository } from '@application/ports/productRepository';
import { getProducts } from '@application/product/getProducts';
import { getProductById } from '@application/product/getProductById';
import { toProductDtoList, toProductDto } from '@presentation/api/dto/productDto';
import { isOk } from '@shared/functional/result';

/**
 * ProductController
 * 商品関連のHTTPリクエストを処理
 */
export type ProductController = {
  getProducts: (c: Context) => Promise<Response>;
  getProductById: (c: Context) => Promise<Response>;
};

const invalidIdResponse = (c: Context) =>
  c.json(
    {
      error: {
        type: 'INVALID_PARAMETER',
        message: '無効な商品IDです',
      },
    },
    400
  );

const serverErrorResponse = (c: Context, type: string, message: string) =>
  c.json(
    {
      error: {
        type,
        message,
      },
    },
    500
  );

/**
 * ProductControllerを作成
 */
export const createProductController = (repository: ProductRepository): ProductController => {
  return {
    /**
     * GET /products - 商品一覧を取得
     */
    getProducts: async (c: Context): Promise<Response> => {
      const result = await getProducts(repository)();

      if (isOk(result)) {
        const productDtos = toProductDtoList(result.value);
        return c.json({ products: productDtos }, 200);
      }

      return serverErrorResponse(c, result.error.type, result.error.message);
    },

    /**
     * GET /products/:id - 商品詳細を取得
     */
    getProductById: async (c: Context): Promise<Response> => {
      const params = c.req.valid('param');
      const paramId = params?.id ?? c.req.param('id');
      const id = typeof paramId === 'number' ? paramId : parseInt(paramId ?? '', 10);

      if (!Number.isFinite(id)) {
        return invalidIdResponse(c);
      }

      const result = await getProductById(repository)(id);

      if (isOk(result)) {
        const productDto = toProductDto(result.value);
        return c.json(productDto, 200);
      }

      if (result.error.type === 'NOT_FOUND') {
        return c.json(
          {
            error: {
              type: result.error.type,
              message: result.error.message,
            },
          },
          404
        );
      }

      return serverErrorResponse(c, result.error.type, result.error.message);
    },
  };
};
