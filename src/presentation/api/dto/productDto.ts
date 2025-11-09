import { Product, getId, getTitle, getPrice, getDescription } from '@domain/product/product';
import type { components } from '@generated/api-schema';

/**
 * ProductDTO
 * API レスポンス用のデータ転送オブジェクト
 * OpenAPI スキーマから自動生成された型を使用
 */
export type ProductDto = components['schemas']['ProductDto'];

/**
 * ProductドメインモデルをProductDTOに変換
 */
export const toProductDto = (product: Product): ProductDto => {
  const description = getDescription(product);
  return {
    id: getId(product),
    title: getTitle(product),
    price: getPrice(product),
    description: description.trim() === '' ? null : description,
  };
};

/**
 * Product配列をProductDTO配列に変換
 */
export const toProductDtoList = (products: readonly Product[]): ProductDto[] => {
  return products.map(toProductDto);
};
