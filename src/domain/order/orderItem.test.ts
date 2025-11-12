import { describe, it, expect } from 'bun:test';
import { OrderItem, createOrderItem, calculateSubtotal } from './orderItem';
import { isOk, isErr } from '@shared/functional/result';

describe('OrderItem', () => {
  describe('createOrderItem', () => {
    it('should successfully create an order item with valid data', () => {
      const result = createOrderItem(1, 5, 1000);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.productId).toBe(1);
        expect(result.value.quantity).toBe(5);
        expect(result.value.unitPrice).toBe(1000);
      }
    });

    it('should fail if product ID is zero', () => {
      const result = createOrderItem(0, 5, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRODUCT_ID');
        expect(result.error.message).toContain('商品ID');
      }
    });

    it('should fail if product ID is negative', () => {
      const result = createOrderItem(-1, 5, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRODUCT_ID');
      }
    });

    it('should fail if quantity is zero', () => {
      const result = createOrderItem(1, 0, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
        expect(result.error.message).toContain('数量');
      }
    });

    it('should fail if quantity is negative', () => {
      const result = createOrderItem(1, -5, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
      }
    });

    it('should fail if quantity exceeds maximum (999)', () => {
      const result = createOrderItem(1, 1000, 1000);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
        expect(result.error.message).toContain('999');
      }
    });

    it('should fail if unit price is negative', () => {
      const result = createOrderItem(1, 5, -100);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRICE');
        expect(result.error.message).toContain('単価');
      }
    });

    it('should allow unit price of zero (free items)', () => {
      const result = createOrderItem(1, 5, 0);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.unitPrice).toBe(0);
      }
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate correct subtotal', () => {
      const result = createOrderItem(1, 5, 1000);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotal = calculateSubtotal(result.value);
        expect(subtotal).toBe(5000); // 5 * 1000
      }
    });

    it('should calculate zero for free items', () => {
      const result = createOrderItem(1, 10, 0);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotal = calculateSubtotal(result.value);
        expect(subtotal).toBe(0);
      }
    });

    it('should handle decimal prices correctly', () => {
      const result = createOrderItem(1, 3, 99.99);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotal = calculateSubtotal(result.value);
        expect(subtotal).toBeCloseTo(299.97, 2);
      }
    });
  });
});
