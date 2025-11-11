import type { Database } from 'bun:sqlite';
import type { ProductRepository } from '@application/ports/productRepository';
import { createProduct, type Product } from '@domain/product/product';
import { ok, err, type Result } from '@shared/functional/result';

/**
 * データベースエラー
 */
export type DatabaseError = {
  readonly type: 'DATABASE_ERROR';
  readonly message: string;
};

/**
 * 商品が見つからないエラー
 */
export type NotFoundError = {
  readonly type: 'NOT_FOUND';
  readonly message: string;
};

/**
 * リポジトリエラー
 */
export type RepositoryError = DatabaseError | NotFoundError;

/**
 * データベースの行型
 */
type ProductRow = {
  id: number;
  title: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
};

/**
 * データベース行をドメインモデルに変換
 */
const rowToProduct = (row: ProductRow): Result<Product, DatabaseError> => {
  const result = createProduct({
    id: row.id,
    title: row.title,
    price: row.price,
    description: row.description,
  });

  if (result._tag === 'Ok') {
    return ok(result.value);
  }

  // バリデーションエラーをデータベースエラーに変換
  return err({
    type: 'DATABASE_ERROR',
    message: `データベースから取得した値が不正です: ${result.error.message}`,
  });
};

/**
 * SQLite実装のProductRepository
 */
export const createSqliteProductRepository = (db: Database): ProductRepository => {
  return {
    /**
     * 全商品を取得
     */
    findAll: async (): Promise<Result<readonly Product[], RepositoryError>> => {
      try {
        const query = db.query<ProductRow, []>('SELECT * FROM products ORDER BY id');
        const rows = query.all();

        // 各行をProductに変換
        const products: Product[] = [];
        for (const row of rows) {
          const productResult = rowToProduct(row);
          if (productResult._tag === 'Err') {
            return productResult;
          }
          products.push(productResult.value);
        }

        return ok(products as readonly Product[]);
      } catch (error) {
        return err({
          type: 'DATABASE_ERROR',
          message: `商品一覧の取得に失敗しました: ${error}`,
        });
      }
    },

    /**
     * IDで商品を取得
     */
    findById: async (id: number): Promise<Result<Product, RepositoryError>> => {
      try {
        const query = db.query<ProductRow, [number]>('SELECT * FROM products WHERE id = ?');
        const row = query.get(id);

        if (!row) {
          return err({
            type: 'NOT_FOUND',
            message: `商品ID ${id} が見つかりません`,
          });
        }

        return rowToProduct(row);
      } catch (error) {
        return err({
          type: 'DATABASE_ERROR',
          message: `商品の取得に失敗しました: ${error}`,
        });
      }
    },

    /**
     * 商品を保存
     */
    save: async (product: Product): Promise<Result<Product, RepositoryError>> => {
      try {
        const insertQuery = db.query<
          ProductRow,
          [number, string, number, string]
        >(
          `INSERT INTO products (id, title, price, description)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             price = excluded.price,
             description = excluded.description,
             updated_at = datetime('now')`
        );

        insertQuery.run(
          product.id.value,
          product.title,
          product.price.value,
          product.description
        );

        // 保存した商品を取得
        return await createSqliteProductRepository(db).findById(product.id.value);
      } catch (error) {
        return err({
          type: 'DATABASE_ERROR',
          message: `商品の保存に失敗しました: ${error}`,
        });
      }
    },

    /**
     * 商品を削除
     */
    delete: async (id: number): Promise<Result<void, RepositoryError>> => {
      try {
        const deleteQuery = db.query<unknown, [number]>('DELETE FROM products WHERE id = ?');
        const result = deleteQuery.run(id);

        if (result.changes === 0) {
          return err({
            type: 'NOT_FOUND',
            message: `商品ID ${id} が見つかりません`,
          });
        }

        return ok(undefined);
      } catch (error) {
        return err({
          type: 'DATABASE_ERROR',
          message: `商品の削除に失敗しました: ${error}`,
        });
      }
    },
  };
};
