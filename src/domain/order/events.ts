import type { Money } from '@domain/shared/valueObjects/money';
import type { ValidatedCustomerInfo } from './customerInfo';
import type { OrderItem } from './orderItem';
import type { PersistedValidatedOrder } from './validatedOrder';

/**
 * 注文が作成されたときに発生するドメインイベント
 */
export type OrderCreatedEvent = {
  readonly type: 'ORDER_CREATED';
  readonly payload: {
    readonly orderId: number;
    readonly customerInfo: ValidatedCustomerInfo;
    readonly totalAmount: Money;
    readonly orderItems: ReadonlyArray<OrderItem>;
    readonly createdAt: Date;
  };
};

/**
 * 注文に関するすべてのドメインイベント
 */
export type OrderEvent = OrderCreatedEvent;

/**
 * 永続化済み注文から注文作成イベントを生成
 *
 * @param order - 永続化済みValidatedOrder
 * @returns OrderCreatedEvent
 */
export const createOrderCreatedEvent = (
  order: PersistedValidatedOrder
): OrderCreatedEvent => ({
  type: 'ORDER_CREATED',
  payload: {
    orderId: order.id,
    customerInfo: order.customerInfo,
    totalAmount: order.totalAmount,
    orderItems: order.orderItems,
    createdAt: new Date(),
  },
});
