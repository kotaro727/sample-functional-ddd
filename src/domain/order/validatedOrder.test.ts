import { describe, it, expect } from 'bun:test';
import { ValidatedOrder, createValidatedOrder, calculateTotalAmount } from './validatedOrder';
import { createOrderItem } from './orderItem';
import { validateShippingAddress } from './shippingAddress';
import { validateCustomerInfo } from './customerInfo';
import { isOk, isErr } from '@shared/functional/result';

describe('ValidatedOrder', () => {
  // テスト用のヘルパー
  const createValidShippingAddress = () => {
    return validateShippingAddress({
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '渋谷区',
      addressLine: '神南1-2-3',
    });
  };

  const createValidCustomerInfo = () => {
    return validateCustomerInfo({
      name: '山田太郎',
      email: 'yamada@example.com',
      phone: '09012345678',
    });
  };

  describe('createValidatedOrder', () => {
    it('should successfully create a validated order with valid data', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();
      const orderItem1 = createOrderItem(1, 2, 1000);
      const orderItem2 = createOrderItem(2, 3, 500);

      expect(isOk(shippingAddressResult)).toBe(true);
      expect(isOk(customerInfoResult)).toBe(true);
      expect(isOk(orderItem1)).toBe(true);
      expect(isOk(orderItem2)).toBe(true);

      if (isOk(shippingAddressResult) && isOk(customerInfoResult) && isOk(orderItem1) && isOk(orderItem2)) {
        const result = createValidatedOrder({
          orderItems: [orderItem1.value, orderItem2.value],
          shippingAddress: shippingAddressResult.value,
          customerInfo: customerInfoResult.value,
        });

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value.orderItems).toHaveLength(2);
          expect(result.value.shippingAddress._tag).toBe('ValidatedShippingAddress');
          expect(result.value.customerInfo._tag).toBe('ValidatedCustomerInfo');
          expect(result.value.shippingStatus).toBe('PENDING');
          expect(result.value.totalAmount).toBe(3500); // (2 * 1000) + (3 * 500)
        }
      }
    });

    it('should fail if order items array is empty', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();

      expect(isOk(shippingAddressResult)).toBe(true);
      expect(isOk(customerInfoResult)).toBe(true);

      if (isOk(shippingAddressResult) && isOk(customerInfoResult)) {
        const result = createValidatedOrder({
          orderItems: [],
          shippingAddress: shippingAddressResult.value,
          customerInfo: customerInfoResult.value,
        });

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error.type).toBe('EMPTY_ORDER_ITEMS');
          expect(result.error.message).toContain('1つ以上');
        }
      }
    });

    it('should correctly calculate total amount for single item', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();
      const orderItem = createOrderItem(1, 5, 1000);

      expect(isOk(shippingAddressResult)).toBe(true);
      expect(isOk(customerInfoResult)).toBe(true);
      expect(isOk(orderItem)).toBe(true);

      if (isOk(shippingAddressResult) && isOk(customerInfoResult) && isOk(orderItem)) {
        const result = createValidatedOrder({
          orderItems: [orderItem.value],
          shippingAddress: shippingAddressResult.value,
          customerInfo: customerInfoResult.value,
        });

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value.totalAmount).toBe(5000); // 5 * 1000
        }
      }
    });

    it('should correctly calculate total amount for multiple items', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();
      const item1 = createOrderItem(1, 2, 1000);
      const item2 = createOrderItem(2, 3, 500);
      const item3 = createOrderItem(3, 1, 2000);

      expect(isOk(shippingAddressResult)).toBe(true);
      expect(isOk(customerInfoResult)).toBe(true);
      expect(isOk(item1)).toBe(true);
      expect(isOk(item2)).toBe(true);
      expect(isOk(item3)).toBe(true);

      if (
        isOk(shippingAddressResult) &&
        isOk(customerInfoResult) &&
        isOk(item1) &&
        isOk(item2) &&
        isOk(item3)
      ) {
        const result = createValidatedOrder({
          orderItems: [item1.value, item2.value, item3.value],
          shippingAddress: shippingAddressResult.value,
          customerInfo: customerInfoResult.value,
        });

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.value.totalAmount).toBe(5500); // (2*1000) + (3*500) + (1*2000)
        }
      }
    });
  });

  describe('calculateTotalAmount', () => {
    it('should calculate correct total amount', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();
      const item1 = createOrderItem(1, 2, 1000);
      const item2 = createOrderItem(2, 3, 500);

      if (isOk(shippingAddressResult) && isOk(customerInfoResult) && isOk(item1) && isOk(item2)) {
        const orderResult = createValidatedOrder({
          orderItems: [item1.value, item2.value],
          shippingAddress: shippingAddressResult.value,
          customerInfo: customerInfoResult.value,
        });

        expect(isOk(orderResult)).toBe(true);
        if (isOk(orderResult)) {
          const total = calculateTotalAmount(orderResult.value);
          expect(total).toBe(3500);
        }
      }
    });
  });
});
