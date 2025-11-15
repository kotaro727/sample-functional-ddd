import { describe, test, expect } from 'bun:test';
import { toCreateOrderRequest, toOrderDto, type CreateOrderRequestDto } from './orderDto';
import { isOk } from '@shared/functional/result';
import type { PersistedValidatedOrder } from '@domain/order/order';

describe('toCreateOrderRequest', () => {
  test('正常なDTOをCreateOrderRequestに変換できる', () => {
    // Arrange
    const dto: CreateOrderRequestDto = {
      orderItems: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
      shippingAddress: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine: '千代田1-1-1',
      },
      customerInfo: {
        name: '山田太郎',
        email: 'taro@example.com',
        phone: '090-1234-5678',
      },
    };

    // Act
    const result = toCreateOrderRequest(dto);

    // Assert
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.orderItems).toEqual([
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ]);
      expect(result.value.shippingAddress).toEqual({
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine: '千代田1-1-1',
      });
      expect(result.value.customerInfo).toEqual({
        name: '山田太郎',
        email: 'taro@example.com',
        phone: '090-1234-5678',
      });
    }
  });

  test('単一の注文明細でも変換できる', () => {
    // Arrange
    const dto: CreateOrderRequestDto = {
      orderItems: [{ productId: 1, quantity: 1 }],
      shippingAddress: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine: '千代田1-1-1',
      },
      customerInfo: {
        name: '山田太郎',
        email: 'taro@example.com',
        phone: '090-1234-5678',
      },
    };

    // Act
    const result = toCreateOrderRequest(dto);

    // Assert
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.orderItems).toHaveLength(1);
      expect(result.value.orderItems[0]).toEqual({ productId: 1, quantity: 1 });
    }
  });

  test('複数の注文明細でも変換できる', () => {
    // Arrange
    const dto: CreateOrderRequestDto = {
      orderItems: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 },
        { productId: 3, quantity: 1 },
      ],
      shippingAddress: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine: '千代田1-1-1',
      },
      customerInfo: {
        name: '山田太郎',
        email: 'taro@example.com',
        phone: '090-1234-5678',
      },
    };

    // Act
    const result = toCreateOrderRequest(dto);

    // Assert
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.orderItems).toHaveLength(3);
    }
  });
});

describe('toOrderDto', () => {
  test('PersistedValidatedOrderをOrderDtoに変換できる', () => {
    // Arrange
    const order: PersistedValidatedOrder = {
      id: 1,
      orderItems: [
        { productId: 1, quantity: 2, unitPrice: 999.99, subtotal: 1999.98 },
        { productId: 2, quantity: 1, unitPrice: 1499.99, subtotal: 1499.99 },
      ],
      shippingAddress: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine: '千代田1-1-1',
      },
      customerInfo: {
        name: '山田太郎',
        email: 'taro@example.com',
        phone: '090-1234-5678',
      },
      shippingStatus: 'PENDING',
      totalAmount: 3499.97,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    // Act
    const dto = toOrderDto(order);

    // Assert
    expect(dto.id).toBe(1);
    expect(dto.orderItems).toHaveLength(2);
    expect(dto.orderItems[0]).toEqual({ productId: 1, quantity: 2 });
    expect(dto.orderItems[1]).toEqual({ productId: 2, quantity: 1 });
    expect(dto.shippingAddress).toEqual({
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      addressLine: '千代田1-1-1',
    });
    expect(dto.customerInfo).toEqual({
      name: '山田太郎',
      email: 'taro@example.com',
      phone: '090-1234-5678',
    });
    expect(dto.shippingStatus).toBe('PENDING');
    expect(dto.totalAmount).toBe(3499.97);
    expect(dto.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });

  test('配送ステータスが正しく変換される', () => {
    // Arrange
    const order: PersistedValidatedOrder = {
      id: 2,
      orderItems: [{ productId: 1, quantity: 1, unitPrice: 100, subtotal: 100 }],
      shippingAddress: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine: '千代田1-1-1',
      },
      customerInfo: {
        name: '山田太郎',
        email: 'taro@example.com',
        phone: '090-1234-5678',
      },
      shippingStatus: 'SHIPPED',
      totalAmount: 100,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    // Act
    const dto = toOrderDto(order);

    // Assert
    expect(dto.shippingStatus).toBe('SHIPPED');
  });

  test('createdAtがISO文字列に変換される', () => {
    // Arrange
    const testDate = new Date('2024-06-15T12:34:56.789Z');
    const order: PersistedValidatedOrder = {
      id: 3,
      orderItems: [{ productId: 1, quantity: 1, unitPrice: 100, subtotal: 100 }],
      shippingAddress: {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        addressLine: '千代田1-1-1',
      },
      customerInfo: {
        name: '山田太郎',
        email: 'taro@example.com',
        phone: '090-1234-5678',
      },
      shippingStatus: 'DELIVERED',
      totalAmount: 100,
      createdAt: testDate,
    };

    // Act
    const dto = toOrderDto(order);

    // Assert
    expect(dto.createdAt).toBe('2024-06-15T12:34:56.789Z');
  });
});
