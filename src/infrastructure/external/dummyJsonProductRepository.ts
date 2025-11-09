import { ProductRepository, ProductRepositoryError } from '@application/ports/productRepository';
import { Product, createProduct, ProductError } from '@domain/product/product';
import { Result, ok, err } from '@shared/functional/result';

/**
 * DummyJSON APIのレスポンス型
 */
type DummyJsonProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
};

type DummyJsonResponse = {
  products: DummyJsonProduct[];
};

/**
 * DummyJSON APIから取得したデータをProductドメインモデルに変換
 */
const toDomainProduct = (data: DummyJsonProduct): Result<Product, ProductError> => {
  return createProduct({
    id: data.id,
    title: data.title,
    price: data.price,
    description: data.description,
  });
};

/**
 * ProductErrorをProductRepositoryErrorに変換
 */
const toRepositoryError = (error: ProductError): ProductRepositoryError => {
  return {
    type: 'UNKNOWN_ERROR',
    message: `バリデーションエラー: ${error.message}`,
  };
};

/**
 * DummyJsonProductRepositoryの実装を作成
 */
export const createDummyJsonProductRepository = (): ProductRepository => {
  const baseUrl = 'https://dummyjson.com';

  return {
    findAll: async (): Promise<Result<readonly Product[], ProductRepositoryError>> => {
      try {
        const response = await fetch(`${baseUrl}/products`);

        if (!response.ok) {
          return err({
            type: 'NETWORK_ERROR',
            message: `HTTPエラー: ${response.status}`,
          });
        }

        const data: DummyJsonResponse = await response.json();

        // 全ての商品データをドメインモデルに変換
        const products: Product[] = [];
        for (const item of data.products) {
          const result = toDomainProduct(item);

          if (result._tag === 'Ok') {
            products.push(result.value);
          } else {
            // バリデーションエラーの場合はスキップして続行
            console.warn(`商品ID ${item.id} の変換に失敗:`, result.error);
          }
        }

        return ok(products as readonly Product[]);
      } catch (error) {
        return err({
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '不明なエラー',
        });
      }
    },

    findById: async (id: number): Promise<Result<Product, ProductRepositoryError>> => {
      try {
        const response = await fetch(`${baseUrl}/products/${id}`);

        if (response.status === 404) {
          return err({
            type: 'NOT_FOUND',
            message: `商品ID ${id} が見つかりません`,
          });
        }

        if (!response.ok) {
          return err({
            type: 'NETWORK_ERROR',
            message: `HTTPエラー: ${response.status}`,
          });
        }

        const data: DummyJsonProduct = await response.json();
        const result = toDomainProduct(data);

        if (result._tag === 'Ok') {
          return ok(result.value);
        } else {
          return err(toRepositoryError(result.error));
        }
      } catch (error) {
        return err({
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '不明なエラー',
        });
      }
    },
  };
};
