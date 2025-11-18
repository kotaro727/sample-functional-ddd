import { describe, it, expect } from 'bun:test';
import { ValidatedOrder, createValidatedOrder, calculateTotalAmount } from './validatedOrder';
import { createOrderItem } from './orderItem';
import { validateShippingAddress } from './shippingAddress';
import { validateCustomerInfo } from './customerInfo';
import { isOk, isErr } from '@shared/functional/result';
import { createMoney, getMoney } from '@domain/shared/valueObjects/money';

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
    it('有効なデータで検証済み注文を作成できる', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();

      const money1 = createMoney(1000);
      const money2 = createMoney(500);
      expect(isOk(money1)).toBe(true);
      expect(isOk(money2)).toBe(true);
      if (!isOk(money1) || !isOk(money2)) return;

      const orderItem1 = createOrderItem(1, 2, money1.value);
      const orderItem2 = createOrderItem(2, 3, money2.value);

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
          expect(getMoney(result.value.totalAmount)).toBe(3500); // (2 * 1000) + (3 * 500)
        }
      }
    });

    it('注文明細が空の場合はエラーになる', () => {
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

    it('単一明細の合計金額を正しく計算できる', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();

      const money = createMoney(1000);
      expect(isOk(money)).toBe(true);
      if (!isOk(money)) return;

      const orderItem = createOrderItem(1, 5, money.value);

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
          expect(getMoney(result.value.totalAmount)).toBe(5000); // 5 * 1000
        }
      }
    });

    it('複数明細の合計金額を正しく計算できる', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();

      const money1 = createMoney(1000);
      const money2 = createMoney(500);
      const money3 = createMoney(2000);
      expect(isOk(money1)).toBe(true);
      expect(isOk(money2)).toBe(true);
      expect(isOk(money3)).toBe(true);
      if (!isOk(money1) || !isOk(money2) || !isOk(money3)) return;

      const item1 = createOrderItem(1, 2, money1.value);
      const item2 = createOrderItem(2, 3, money2.value);
      const item3 = createOrderItem(3, 1, money3.value);

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
          expect(getMoney(result.value.totalAmount)).toBe(5500); // (2*1000) + (3*500) + (1*2000)
        }
      }
    });
  });

  describe('calculateTotalAmount', () => {
    it('合計金額を正しく取得できる', () => {
      const shippingAddressResult = createValidShippingAddress();
      const customerInfoResult = createValidCustomerInfo();

      const money1 = createMoney(1000);
      const money2 = createMoney(500);
      expect(isOk(money1)).toBe(true);
      expect(isOk(money2)).toBe(true);
      if (!isOk(money1) || !isOk(money2)) return;

      const item1 = createOrderItem(1, 2, money1.value);
      const item2 = createOrderItem(2, 3, money2.value);

      if (isOk(shippingAddressResult) && isOk(customerInfoResult) && isOk(item1) && isOk(item2)) {
        const orderResult = createValidatedOrder({
          orderItems: [item1.value, item2.value],
          shippingAddress: shippingAddressResult.value,
          customerInfo: customerInfoResult.value,
        });

        expect(isOk(orderResult)).toBe(true);
        if (isOk(orderResult)) {
          const total = calculateTotalAmount(orderResult.value);
          expect(getMoney(total)).toBe(3500);
        }
      }
    });
  });
});
