import type { Product } from '@domain/product/product';
import type { ProductRepository, ProductRepositoryError } from '@application/ports/productRepository';
import type { Result } from '@shared/functional/result';

/**
 * 商品IDで商品を取得するユースケース
 * @param repository - 商品リポジトリ
 * @returns 商品ID を受け取り Product または Error を返す関数
 */
export const getProductById =
  (repository: ProductRepository) =>
  async (id: number): Promise<Result<Product, ProductRepositoryError>> => {
    return await repository.findById(id);
  };
