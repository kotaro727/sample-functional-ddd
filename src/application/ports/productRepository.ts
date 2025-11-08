import { Product } from '@domain/product/product';
import { Result } from '@shared/functional/result';

/**
 * ProductRepositoryのエラー型
 */
export type ProductRepositoryError =
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

/**
 * ProductRepositoryポート
 * 商品データの永続化と取得を抽象化するインターフェース
 */
export interface ProductRepository {
  /**
   * 全ての商品を取得
   */
  findAll: () => Promise<Result<readonly Product[], ProductRepositoryError>>;

  /**
   * IDで商品を取得
   */
  findById: (id: number) => Promise<Result<Product, ProductRepositoryError>>;
}
