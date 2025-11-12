/**
 * Order ドメインモデルの統合エクスポート
 */

// 配送ステータス
export type { ShippingStatus, ShippingStatusError } from './shippingStatus';
export {
  isPending,
  isShipped,
  isDelivered,
  canTransitionTo,
  transitionTo,
} from './shippingStatus';

// 配送先住所
export type {
  UnvalidatedShippingAddress,
  ValidatedShippingAddress,
  ShippingAddressValidationError,
} from './shippingAddress';
export { validateShippingAddress } from './shippingAddress';

// 顧客情報
export type {
  UnvalidatedCustomerInfo,
  ValidatedCustomerInfo,
  CustomerInfoValidationError,
} from './customerInfo';
export { validateCustomerInfo } from './customerInfo';

// 注文明細
export type { OrderItem, OrderItemValidationError } from './orderItem';
export { createOrderItem, calculateSubtotal } from './orderItem';

// 検証済み注文
export type {
  ValidatedOrder,
  PersistedValidatedOrder,
  ValidatedOrderCreationError,
  CreateValidatedOrderParams,
} from './validatedOrder';
export { createValidatedOrder, calculateTotalAmount } from './validatedOrder';
