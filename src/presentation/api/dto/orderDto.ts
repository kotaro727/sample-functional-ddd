import type { components } from '@generated/api-schema';
import type { CreateOrderRequest } from '@application/order/createOrder';
import type { PersistedValidatedOrder } from '@domain/order/order';
import { Result, ok } from '@shared/functional/result';

/**
 * OpenAPIで生成されたCreateOrderRequest型
 */
export type CreateOrderRequestDto = components['schemas']['CreateOrderRequest'];

/**
 * OpenAPIで生成されたOrderDto型
 */
export type OrderDto = components['schemas']['OrderDto'];

/**
 * CreateOrderRequestDto から Application層の CreateOrderRequest に変換
 *
 * OpenAPIでバリデーション済みのため、この関数では型変換のみを行う
 *
 * @param dto - OpenAPIで検証済みのDTO
 * @returns Application層で使用するCreateOrderRequest
 */
export const toCreateOrderRequest = (
  dto: CreateOrderRequestDto
): Result<CreateOrderRequest, never> => {
  return ok({
    orderItems: dto.orderItems,
    shippingAddress: dto.shippingAddress,
    customerInfo: dto.customerInfo,
  });
};

/**
 * PersistedValidatedOrder から OrderDto に変換
 *
 * Domain層の注文をAPIレスポンス用のDTOに変換する純粋関数
 *
 * @param order - Domain層の永続化済み検証済み注文
 * @returns APIレスポンス用のOrderDto
 */
export const toOrderDto = (order: PersistedValidatedOrder): OrderDto => ({
  id: order.id,
  orderItems: order.orderItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  })),
  shippingAddress: order.shippingAddress,
  customerInfo: order.customerInfo,
  shippingStatus: order.shippingStatus,
  totalAmount: order.totalAmount,
  createdAt: order.createdAt.toISOString(),
});
