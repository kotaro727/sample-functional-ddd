import { Result, ok, err, flatMap, map } from '@shared/functional/result';
import { pipe } from '@shared/functional/pipe';
import {
  ProductId,
  createProductId,
  getValue as getProductIdValue,
  ProductIdError,
} from './valueObjects/productId';
import { Price, createPrice, getValue as getPriceValue, PriceError } from './valueObjects/price';

/**
 * Product集約
 * 商品を表すドメインモデル
 */
export type Product = Readonly<{
  id: ProductId;
  title: string;
  price: Price;
  description: string;
}>;

/**
 * Productのバリデーションエラー
 */
export type ProductError =
  | ProductIdError
  | PriceError
  | { type: 'EMPTY_TITLE'; message: 'タイトルは必須です' };

/**
 * Product作成用の入力データ
 */
export type ProductInput = {
  id: number;
  title: string;
  price: number;
  description: string;
};

/**
 * Productを作成（バリデーション付き）
 */
export const createProduct = (input: ProductInput): Result<Product, ProductError> => {
  // タイトルのバリデーション
  if (input.title.trim() === '') {
    return err({ type: 'EMPTY_TITLE', message: 'タイトルは必須です' });
  }

  // 値オブジェクトの作成とProduct組み立て
  const productIdResult = createProductId(input.id);
  const priceResult = createPrice(input.price);

  // Result型の合成
  return pipe(
    productIdResult,
    flatMap((id) =>
      pipe(
        priceResult,
        map((price) => ({
          id,
          title: input.title,
          price,
          description: input.description,
        }))
      )
    )
  );
};

/**
 * ProductのIDを取得
 */
export const getId = (product: Product): number => getProductIdValue(product.id);

/**
 * Productのタイトルを取得
 */
export const getTitle = (product: Product): string => product.title;

/**
 * Productの価格を取得
 */
export const getPrice = (product: Product): number => getPriceValue(product.price);

/**
 * Productの説明を取得
 */
export const getDescription = (product: Product): string => product.description;
