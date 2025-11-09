import { Product, getId, getTitle, getPrice, getDescription } from '@domain/product/product';

/**
 * ProductDTO
 * API レスポンス用のデータ転送オブジェクト
 */
export type ProductDto = {
  id: number;
  title: string;
  price: number;
  description: string;
};

/**
 * ProductドメインモデルをProductDTOに変換
 */
export const toProductDto = (product: Product): ProductDto => {
  return {
    id: getId(product),
    title: getTitle(product),
    price: getPrice(product),
    description: getDescription(product),
  };
};

/**
 * Product配列をProductDTO配列に変換
 */
export const toProductDtoList = (products: readonly Product[]): ProductDto[] => {
  return products.map(toProductDto);
};
