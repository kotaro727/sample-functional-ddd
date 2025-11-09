import { Request, Response } from 'express';
import { ProductRepository } from '@application/ports/productRepository';
import { getProducts } from '@application/product/getProducts';
import { toProductDtoList } from '@presentation/api/dto/productDto';
import { isOk } from '@shared/functional/result';

/**
 * ProductController
 * 商品関連のHTTPリクエストを処理
 */
export type ProductController = {
  getProducts: (req: Request, res: Response) => Promise<void>;
};

/**
 * ProductControllerを作成
 */
export const createProductController = (repository: ProductRepository): ProductController => {
  return {
    /**
     * GET /products - 商品一覧を取得
     */
    getProducts: async (req: Request, res: Response): Promise<void> => {
      const result = await getProducts(repository)();

      if (isOk(result)) {
        const productDtos = toProductDtoList(result.value);
        res.status(200).json({ products: productDtos });
      } else {
        res.status(500).json({
          error: {
            type: result.error.type,
            message: result.error.message,
          },
        });
      }
    },
  };
};
