import { describe, test, expect } from 'bun:test';
import { decreaseInventory } from './decreaseInventory';
import type { OrderCreatedEvent } from '@domain/order/events';
import type { InventoryService } from '@application/ports/inventoryService';
import { ok, err } from '@shared/functional/result';
import { createMoney } from '@domain/shared/valueObjects/money';

describe('decreaseInventory', () => {
  describe('在庫減少イベントハンドラー', () => {
    test('OrderCreatedEventを受け取って在庫を減らす', async () => {
      // Arrange
      const decreasedItems: Array<{ productId: number; quantity: number }> = [];

      const mockInventoryService: InventoryService = {
        decrease: async (productId, quantity) => {
          decreasedItems.push({ productId, quantity });
          return ok(undefined);
        },
        increase: async () => ok(undefined),
        getStock: async () => ok({ productId: 1, quantity: 100 }),
      };

      const event: OrderCreatedEvent = {
        type: 'ORDER_CREATED',
        payload: {
          orderId: 1,
          customerInfo: {
            name: '山田太郎',
            email: 'yamada@example.com',
            phone: '090-1234-5678',
          },
          totalAmount: createMoney(5000).value,
          orderItems: [
            {
              productId: 101,
              quantity: 2,
              unitPrice: createMoney(1000).value,
            },
            {
              productId: 102,
              quantity: 3,
              unitPrice: createMoney(1000).value,
            },
          ],
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
      };

      const handler = decreaseInventory(mockInventoryService);

      // Act
      await handler(event);

      // Assert
      expect(decreasedItems).toHaveLength(2);
      expect(decreasedItems[0]).toEqual({ productId: 101, quantity: 2 });
      expect(decreasedItems[1]).toEqual({ productId: 102, quantity: 3 });
    });

    test('在庫減少に失敗してもエラーをスローしない', async () => {
      // Arrange
      const mockInventoryService: InventoryService = {
        decrease: async () =>
          err({
            type: 'INSUFFICIENT_STOCK',
            message: '在庫が不足しています',
          }),
        increase: async () => ok(undefined),
        getStock: async () => ok({ productId: 1, quantity: 100 }),
      };

      const event: OrderCreatedEvent = {
        type: 'ORDER_CREATED',
        payload: {
          orderId: 1,
          customerInfo: {
            name: '山田太郎',
            email: 'yamada@example.com',
            phone: '090-1234-5678',
          },
          totalAmount: createMoney(2000).value,
          orderItems: [
            {
              productId: 101,
              quantity: 2,
              unitPrice: createMoney(1000).value,
            },
          ],
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
      };

      const handler = decreaseInventory(mockInventoryService);

      // Act & Assert - エラーがスローされないことを確認
      await expect(handler(event)).resolves.toBeUndefined();
    });

    test('複数商品の在庫を順番に減らす', async () => {
      // Arrange
      const decreaseLog: string[] = [];

      const mockInventoryService: InventoryService = {
        decrease: async (productId, quantity) => {
          decreaseLog.push(`商品${productId}を${quantity}個減らしました`);
          return ok(undefined);
        },
        increase: async () => ok(undefined),
        getStock: async () => ok({ productId: 1, quantity: 100 }),
      };

      const event: OrderCreatedEvent = {
        type: 'ORDER_CREATED',
        payload: {
          orderId: 1,
          customerInfo: {
            name: '山田太郎',
            email: 'yamada@example.com',
            phone: '090-1234-5678',
          },
          totalAmount: createMoney(7000).value,
          orderItems: [
            {
              productId: 201,
              quantity: 1,
              unitPrice: createMoney(2000).value,
            },
            {
              productId: 202,
              quantity: 5,
              unitPrice: createMoney(500).value,
            },
            {
              productId: 203,
              quantity: 2,
              unitPrice: createMoney(1000).value,
            },
          ],
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
      };

      const handler = decreaseInventory(mockInventoryService);

      // Act
      await handler(event);

      // Assert
      expect(decreaseLog).toHaveLength(3);
      expect(decreaseLog[0]).toContain('商品201を1個減らしました');
      expect(decreaseLog[1]).toContain('商品202を5個減らしました');
      expect(decreaseLog[2]).toContain('商品203を2個減らしました');
    });
  });
});
