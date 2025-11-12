import { describe, it, expect } from 'bun:test';
import { OrderItem, createOrderItem, calculateSubtotal } from './orderItem';
import { isOk, isErr } from '@shared/functional/result';

describe('OrderItem', () => {
  describe('createOrderItem', () => {
    it('有効なデータで注文明細を作成できる', () => {
      const result = createOrderItem(1, 5, 1000);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.productId).toBe(1);
        expect(result.value.quantity).toBe(5);
        expect(result.value.unitPrice).toBe(1000);
      }
    });

    it('商品IDが0の場合はエラーになる', () => {
      const result = createOrderItem(0, 5, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRODUCT_ID');
        expect(result.error.message).toContain('商品ID');
      }
    });

    it('商品IDが負の場合はエラーになる', () => {
      const result = createOrderItem(-1, 5, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRODUCT_ID');
      }
    });

    it('数量が0の場合はエラーになる', () => {
      const result = createOrderItem(1, 0, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
        expect(result.error.message).toContain('数量');
      }
    });

    it('数量が負の場合はエラーになる', () => {
      const result = createOrderItem(1, -5, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
      }
    });

    it('数量が最大値999を超える場合はエラーになる', () => {
      const result = createOrderItem(1, 1000, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
        expect(result.error.message).toContain('999');
      }
    });

    it('単価が負の場合はエラーになる', () => {
      const result = createOrderItem(1, 5, -100);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRICE');
        expect(result.error.message).toContain('単価');
      }
    });

    it('単価が0の場合は許可される（無料商品）', () => {
      const result = createOrderItem(1, 5, 0);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.unitPrice).toBe(0);
      }
    });
  });

  describe('calculateSubtotal', () => {
    it('小計を正しく計算できる', () => {
      const result = createOrderItem(1, 5, 1000);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotal = calculateSubtotal(result.value);
        expect(subtotal).toBe(5000); // 5 * 1000
      }
    });

    it('無料商品の小計は0になる', () => {
      const result = createOrderItem(1, 10, 0);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotal = calculateSubtotal(result.value);
        expect(subtotal).toBe(0);
      }
    });

    it('小数点の単価を正しく計算できる', () => {
      const result = createOrderItem(1, 3, 99.99);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotal = calculateSubtotal(result.value);
        expect(subtotal).toBeCloseTo(299.97, 2);
      }
    });
  });
});
