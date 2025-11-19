import { describe, test, expect } from 'bun:test';
import { createOrderCreatedEvent } from './events';
import type { PersistedValidatedOrder } from './validatedOrder';
import { createMoney } from '@domain/shared/valueObjects/money';

describe('OrderCreatedEvent', () => {
  describe('createOrderCreatedEvent', () => {
    test('永続化済み注文からOrderCreatedEventを生成できる', () => {
      // Arrange
      const persistedOrder: PersistedValidatedOrder = {
        id: 1,
        orderItems: [
          {
            productId: 101,
            quantity: 2,
            unitPrice: createMoney(1000).value,
          },
        ],
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'yamada@example.com',
          phone: '090-1234-5678',
        },
        shippingStatus: 'PENDING',
        totalAmount: createMoney(2000).value,
        createdAt: new Date('2025-01-15T10:00:00Z'),
      };

      // Act
      const event = createOrderCreatedEvent(persistedOrder);

      // Assert
      expect(event.type).toBe('ORDER_CREATED');
      expect(event.payload.orderId).toBe(1);
      expect(event.payload.customerInfo).toEqual(persistedOrder.customerInfo);
      expect(event.payload.totalAmount).toEqual(persistedOrder.totalAmount);
      expect(event.payload.orderItems).toEqual(persistedOrder.orderItems);
      expect(event.payload.createdAt).toBeInstanceOf(Date);
    });

    test('イベントペイロードは不変である', () => {
      // Arrange
      const persistedOrder: PersistedValidatedOrder = {
        id: 1,
        orderItems: [
          {
            productId: 101,
            quantity: 2,
            unitPrice: createMoney(1000).value,
          },
        ],
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'yamada@example.com',
          phone: '090-1234-5678',
        },
        shippingStatus: 'PENDING',
        totalAmount: createMoney(2000).value,
        createdAt: new Date('2025-01-15T10:00:00Z'),
      };

      // Act
      const event = createOrderCreatedEvent(persistedOrder);

      // Assert - TypeScriptの型チェックで不変性を保証
      // @ts-expect-error - readonlyプロパティは変更できない
      event.payload.orderId = 999;
    });
  });
});
