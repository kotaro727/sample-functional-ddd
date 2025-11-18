import { describe, it, expect } from 'bun:test';
import { OrderItem, createOrderItem, calculateSubtotal } from './orderItem';
import { isOk, isErr } from '@shared/functional/result';
import { createMoney, getMoney } from '@domain/shared/valueObjects/money';

describe('OrderItem', () => {
  describe('createOrderItem', () => {
    it('有効なデータで注文明細を作成できる', () => {
      const moneyResult = createMoney(1000);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(1, 5, moneyResult.value);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.productId).toBe(1);
        expect(result.value.quantity).toBe(5);
        expect(getMoney(result.value.unitPrice)).toBe(1000);
      }
    });

    it('商品IDが0の場合はエラーになる', () => {
      const moneyResult = createMoney(1000);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(0, 5, moneyResult.value);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRODUCT_ID');
        expect(result.error.message).toContain('商品ID');
      }
    });

    it('商品IDが負の場合はエラーになる', () => {
      const moneyResult = createMoney(1000);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(-1, 5, moneyResult.value);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_PRODUCT_ID');
      }
    });

    it('数量が0の場合はエラーになる', () => {
      const moneyResult = createMoney(1000);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(1, 0, moneyResult.value);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
        expect(result.error.message).toContain('数量');
      }
    });

    it('数量が負の場合はエラーになる', () => {
      const moneyResult = createMoney(1000);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(1, -5, moneyResult.value);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
      }
    });

    it('数量が最大値999を超える場合はエラーになる', () => {
      const moneyResult = createMoney(1000);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(1, 1000, moneyResult.value);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INVALID_QUANTITY');
        expect(result.error.message).toContain('999');
      }
    });

    it('単価が0の場合は許可される（無料商品）', () => {
      const moneyResult = createMoney(0);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(1, 5, moneyResult.value);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getMoney(result.value.unitPrice)).toBe(0);
      }
    });
  });

  describe('calculateSubtotal', () => {
    it('小計を正しく計算できる', () => {
      const moneyResult = createMoney(1000);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(1, 5, moneyResult.value);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotalResult = calculateSubtotal(result.value);
        expect(isOk(subtotalResult)).toBe(true);
        if (isOk(subtotalResult)) {
          expect(getMoney(subtotalResult.value)).toBe(5000); // 5 * 1000
        }
      }
    });

    it('無料商品の小計は0になる', () => {
      const moneyResult = createMoney(0);
      expect(isOk(moneyResult)).toBe(true);
      if (!isOk(moneyResult)) return;

      const result = createOrderItem(1, 10, moneyResult.value);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        const subtotalResult = calculateSubtotal(result.value);
        expect(isOk(subtotalResult)).toBe(true);
        if (isOk(subtotalResult)) {
          expect(getMoney(subtotalResult.value)).toBe(0);
        }
      }
    });
  });
});
