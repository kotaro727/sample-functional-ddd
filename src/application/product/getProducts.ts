import { Product } from '@domain/product/product';
import { Result } from '@shared/functional/result';
import { ProductRepository, ProductRepositoryError } from '@application/ports/productRepository';

/**
 * getProducts ユースケース
 * 全ての商品を取得する
 *
 * @param repository ProductRepositoryの実装
 * @returns 商品一覧を返す関数（非同期）
 */
export const getProducts =
  (repository: ProductRepository) =>
  (): Promise<Result<readonly Product[], ProductRepositoryError>> => {
    return repository.findAll();
  };
