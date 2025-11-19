import { OrderRepository } from '@application/ports/orderRepository';
import { ProductRepository } from '@application/ports/productRepository';
import { EventBus } from '@application/ports/eventBus';
import {
  PersistedValidatedOrder,
  UnvalidatedShippingAddress,
  UnvalidatedCustomerInfo,
  validateShippingAddress,
  validateCustomerInfo,
  createOrderItem,
  createValidatedOrder,
} from '@domain/order/order';
import { createOrderCreatedEvent } from '@domain/order/events';
import { Result, ok, err, isErr } from '@shared/functional/result';
import { createMoney } from '@domain/shared/valueObjects/money';

/**
 * 注文作成のエラー型
 */
export type CreateOrderError =
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'PRODUCT_NOT_FOUND'; message: string }
  | { type: 'REPOSITORY_ERROR'; message: string };

/**
 * 注文作成リクエスト
 */
export type CreateOrderRequest = {
  orderItems: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddress: UnvalidatedShippingAddress;
  customerInfo: UnvalidatedCustomerInfo;
};

/**
 * 注文作成ユースケース
 *
 * @param orderRepository - 注文リポジトリ
 * @param productRepository - 商品リポジトリ
 * @param eventBus - イベントバス
 * @returns 注文作成関数
 */
export const createOrder =
  (orderRepository: OrderRepository, productRepository: ProductRepository, eventBus: EventBus) =>
  async (request: CreateOrderRequest): Promise<Result<PersistedValidatedOrder, CreateOrderError>> => {
    // 1. 配送先住所の検証
    const validatedAddressResult = validateShippingAddress(request.shippingAddress);
    if (isErr(validatedAddressResult)) {
      return err({
        type: 'VALIDATION_ERROR',
        message: validatedAddressResult.error.message,
      });
    }

    // 2. 顧客情報の検証
    const validatedCustomerInfoResult = validateCustomerInfo(request.customerInfo);
    if (isErr(validatedCustomerInfoResult)) {
      return err({
        type: 'VALIDATION_ERROR',
        message: validatedCustomerInfoResult.error.message,
      });
    }

    // 3. 商品の検証と注文明細の作成
    const orderItems = [];
    for (const item of request.orderItems) {
      // 商品が存在するか確認
      const productResult = await productRepository.findById(item.productId);
      if (isErr(productResult)) {
        return err({
          type: 'PRODUCT_NOT_FOUND',
          message: `商品ID ${item.productId} が見つかりません`,
        });
      }

      // 商品価格をMoney値オブジェクトに変換
      const moneyResult = createMoney(productResult.value.price.value);
      if (isErr(moneyResult)) {
        return err({
          type: 'VALIDATION_ERROR',
          message: `商品価格の変換に失敗しました: ${moneyResult.error.message}`,
        });
      }

      // 注文明細を作成
      const orderItemResult = createOrderItem(
        item.productId,
        item.quantity,
        moneyResult.value
      );
      if (isErr(orderItemResult)) {
        return err({
          type: 'VALIDATION_ERROR',
          message: orderItemResult.error.message,
        });
      }

      orderItems.push(orderItemResult.value);
    }

    // 4. 検証済み注文の作成
    const validatedOrderResult = createValidatedOrder({
      orderItems,
      shippingAddress: validatedAddressResult.value,
      customerInfo: validatedCustomerInfoResult.value,
    });

    if (isErr(validatedOrderResult)) {
      return err({
        type: 'VALIDATION_ERROR',
        message: validatedOrderResult.error.message,
      });
    }

    // 5. リポジトリに保存
    const savedOrderResult = await orderRepository.create(validatedOrderResult.value);
    if (isErr(savedOrderResult)) {
      return err({
        type: 'REPOSITORY_ERROR',
        message: savedOrderResult.error.message,
      });
    }

    // 6. イベントを発行
    await eventBus.publish(createOrderCreatedEvent(savedOrderResult.value));

    return ok(savedOrderResult.value);
  };
