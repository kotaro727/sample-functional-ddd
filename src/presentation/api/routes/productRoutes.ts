import { Router } from 'express';
import { ProductRepository } from '@application/ports/productRepository';
import { createProductController } from '@presentation/api/controllers/productController';

/**
 * 商品関連のルーティングを作成
 */
export const createProductRoutes = (repository: ProductRepository): Router => {
  const router = Router();
  const controller = createProductController(repository);

  // GET /api/products - 商品一覧を取得
  router.get('/products', controller.getProducts);

  return router;
};
