import { describe, it, expect } from 'bun:test';
import { createOrder } from './createOrder';
import { OrderRepository } from '@application/ports/orderRepository';
import { ProductRepository } from '@application/ports/productRepository';
import { EventBus } from '@application/ports/eventBus';
import { isOk, isErr } from '@shared/functional/result';
import { getMoney } from '@domain/shared/valueObjects/money';
import type { OrderCreatedEvent } from '@domain/order/events';

describe('createOrder', () => {
  describe('正常系', () => {
    it('有効な注文データで注文を作成できる', async () => {
      // テスト用のモックリポジトリ
      const mockOrderRepository: OrderRepository = {
        create: async (order) => ({
          _tag: 'Ok',
          value: {
            ...order,
            id: 1,
            createdAt: new Date('2025-01-11T10:00:00Z'),
          },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
        findById: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        updateStatus: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        delete: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
      };

      const mockProductRepository: ProductRepository = {
        findById: async (id) => ({
          _tag: 'Ok',
          value: {
            id: { _brand: 'ProductId' as const, value: id },
            title: `商品${id}`,
            price: { _brand: 'Price' as const, value: 1000 },
            description: '説明',
          },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
      };

      const mockEventBus: EventBus = {
        publish: async () => {},
        subscribe: () => {},
      };

      const result = await createOrder(mockOrderRepository, mockProductRepository, mockEventBus)({
        orderItems: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 3 },
        ],
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '神南1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'yamada@example.com',
          phone: '09012345678',
        },
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id).toBe(1);
        expect(result.value.orderItems).toHaveLength(2);
        expect(getMoney(result.value.totalAmount)).toBe(5000); // (2 * 1000) + (3 * 1000)
        expect(result.value.shippingStatus).toBe('PENDING');
      }
    });
  });

  describe('異常系', () => {
    it('郵便番号が不正な場合はエラーになる', async () => {
      const mockOrderRepository: OrderRepository = {
        create: async () => ({ _tag: 'Err', error: { type: 'UNKNOWN_ERROR', message: '' } }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
        findById: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        updateStatus: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        delete: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
      };

      const mockProductRepository: ProductRepository = {
        findById: async (id) => ({
          _tag: 'Ok',
          value: {
            id: { _brand: 'ProductId' as const, value: id },
            title: `商品${id}`,
            price: { _brand: 'Price' as const, value: 1000 },
            description: '説明',
          },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
      };

      const mockEventBus: EventBus = {
        publish: async () => {},
        subscribe: () => {},
      };

      const result = await createOrder(mockOrderRepository, mockProductRepository, mockEventBus)({
        orderItems: [{ productId: 1, quantity: 2 }],
        shippingAddress: {
          postalCode: '12345', // 不正な郵便番号
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '神南1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'yamada@example.com',
          phone: '09012345678',
        },
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
      }
    });

    it('メールアドレスが不正な場合はエラーになる', async () => {
      const mockOrderRepository: OrderRepository = {
        create: async () => ({ _tag: 'Err', error: { type: 'UNKNOWN_ERROR', message: '' } }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
        findById: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        updateStatus: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        delete: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
      };

      const mockProductRepository: ProductRepository = {
        findById: async (id) => ({
          _tag: 'Ok',
          value: {
            id: { _brand: 'ProductId' as const, value: id },
            title: `商品${id}`,
            price: { _brand: 'Price' as const, value: 1000 },
            description: '説明',
          },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
      };

      const mockEventBus: EventBus = {
        publish: async () => {},
        subscribe: () => {},
      };

      const result = await createOrder(mockOrderRepository, mockProductRepository, mockEventBus)({
        orderItems: [{ productId: 1, quantity: 2 }],
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '神南1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'invalid-email', // 不正なメールアドレス
          phone: '09012345678',
        },
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
      }
    });

    it('商品が見つからない場合はエラーになる', async () => {
      const mockOrderRepository: OrderRepository = {
        create: async () => ({ _tag: 'Err', error: { type: 'UNKNOWN_ERROR', message: '' } }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
        findById: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        updateStatus: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        delete: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
      };

      const mockProductRepository: ProductRepository = {
        findById: async () => ({
          _tag: 'Err',
          error: { type: 'NOT_FOUND', message: '商品が見つかりません' },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
      };

      const mockEventBus: EventBus = {
        publish: async () => {},
        subscribe: () => {},
      };

      const result = await createOrder(mockOrderRepository, mockProductRepository, mockEventBus)({
        orderItems: [{ productId: 999, quantity: 2 }], // 存在しない商品ID
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '神南1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'yamada@example.com',
          phone: '09012345678',
        },
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
      }
    });
  });

  describe('イベント統合', () => {
    it('注文作成成功時にOrderCreatedEventを発行する', async () => {
      // Arrange
      let publishedEvent: OrderCreatedEvent | null = null;

      const mockOrderRepository: OrderRepository = {
        create: async (order) => ({
          _tag: 'Ok',
          value: {
            ...order,
            id: 123,
            createdAt: new Date('2025-01-15T10:00:00Z'),
          },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
        findById: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        updateStatus: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        delete: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
      };

      const mockProductRepository: ProductRepository = {
        findById: async (id) => ({
          _tag: 'Ok',
          value: {
            id: { _brand: 'ProductId' as const, value: id },
            title: `商品${id}`,
            price: { _brand: 'Price' as const, value: 2000 },
            description: '説明',
          },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
      };

      const mockEventBus: EventBus = {
        publish: async <T>(event: T) => {
          publishedEvent = event as OrderCreatedEvent;
        },
        subscribe: () => {},
      };

      // Act
      const result = await createOrder(mockOrderRepository, mockProductRepository, mockEventBus)({
        orderItems: [{ productId: 1, quantity: 3 }],
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '神南1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'yamada@example.com',
          phone: '09012345678',
        },
      });

      // Assert
      expect(isOk(result)).toBe(true);
      expect(publishedEvent).not.toBeNull();
      expect(publishedEvent?.type).toBe('ORDER_CREATED');
      expect(publishedEvent?.payload.orderId).toBe(123);
      expect(publishedEvent?.payload.customerInfo.name).toBe('山田太郎');
      expect(publishedEvent?.payload.customerInfo.email).toBe('yamada@example.com');
      expect(publishedEvent?.payload.totalAmount.value).toBe(6000); // 3 * 2000
    });

    it('注文作成が失敗した場合はイベントを発行しない', async () => {
      // Arrange
      let eventPublished = false;

      const mockOrderRepository: OrderRepository = {
        create: async () => ({ _tag: 'Err', error: { type: 'UNKNOWN_ERROR', message: '' } }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
        findById: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        updateStatus: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
        delete: async () => ({ _tag: 'Err', error: { type: 'NOT_FOUND', message: '' } }),
      };

      const mockProductRepository: ProductRepository = {
        findById: async (id) => ({
          _tag: 'Ok',
          value: {
            id: { _brand: 'ProductId' as const, value: id },
            title: `商品${id}`,
            price: { _brand: 'Price' as const, value: 1000 },
            description: '説明',
          },
        }),
        findAll: async () => ({ _tag: 'Ok', value: [] }),
      };

      const mockEventBus: EventBus = {
        publish: async () => {
          eventPublished = true;
        },
        subscribe: () => {},
      };

      // Act
      const result = await createOrder(mockOrderRepository, mockProductRepository, mockEventBus)({
        orderItems: [{ productId: 1, quantity: 1 }],
        shippingAddress: {
          postalCode: 'invalid', // バリデーションエラーが発生
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '神南1-2-3',
        },
        customerInfo: {
          name: '山田太郎',
          email: 'yamada@example.com',
          phone: '09012345678',
        },
      });

      // Assert
      expect(isErr(result)).toBe(true);
      expect(eventPublished).toBe(false);
    });
  });
});
