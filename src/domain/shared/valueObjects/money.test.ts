import { describe, test, expect } from 'bun:test';
import {
  createMoney,
  addMoney,
  multiplyMoney,
  getMoney,
  type Money,
} from './money';

describe('Money値オブジェクト', () => {
  describe('createMoney', () => {
    test('正の金額でMoney値オブジェクトを作成できる', () => {
      const result = createMoney(1000);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getMoney(result.value)).toBe(1000);
      }
    });

    test('0円のMoney値オブジェクトを作成できる', () => {
      const result = createMoney(0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getMoney(result.value)).toBe(0);
      }
    });

    test('負の金額ではMoney値オブジェクトを作成できない', () => {
      const result = createMoney(-100);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NEGATIVE_AMOUNT');
        expect(result.error.message).toContain('0以上');
      }
    });

    test('小数を含む金額ではMoney値オブジェクトを作成できない', () => {
      const result = createMoney(100.5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NON_INTEGER_AMOUNT');
        expect(result.error.message).toContain('整数');
      }
    });
  });

  describe('addMoney', () => {
    test('2つのMoneyを加算できる', () => {
      const money1Result = createMoney(1000);
      const money2Result = createMoney(500);

      expect(money1Result.success).toBe(true);
      expect(money2Result.success).toBe(true);

      if (money1Result.success && money2Result.success) {
        const sum = addMoney(money1Result.value, money2Result.value);
        expect(getMoney(sum)).toBe(1500);
      }
    });

    test('0円を加算できる', () => {
      const money1Result = createMoney(1000);
      const money2Result = createMoney(0);

      expect(money1Result.success).toBe(true);
      expect(money2Result.success).toBe(true);

      if (money1Result.success && money2Result.success) {
        const sum = addMoney(money1Result.value, money2Result.value);
        expect(getMoney(sum)).toBe(1000);
      }
    });
  });

  describe('multiplyMoney', () => {
    test('Moneyを整数で乗算できる', () => {
      const moneyResult = createMoney(100);

      expect(moneyResult.success).toBe(true);

      if (moneyResult.success) {
        const resultOrError = multiplyMoney(moneyResult.value, 3);
        expect(resultOrError.success).toBe(true);
        if (resultOrError.success) {
          expect(getMoney(resultOrError.value)).toBe(300);
        }
      }
    });

    test('0を乗算すると0円になる', () => {
      const moneyResult = createMoney(100);

      expect(moneyResult.success).toBe(true);

      if (moneyResult.success) {
        const resultOrError = multiplyMoney(moneyResult.value, 0);
        expect(resultOrError.success).toBe(true);
        if (resultOrError.success) {
          expect(getMoney(resultOrError.value)).toBe(0);
        }
      }
    });

    test('負の数を乗算するとエラーになる', () => {
      const moneyResult = createMoney(100);

      expect(moneyResult.success).toBe(true);

      if (moneyResult.success) {
        const resultOrError = multiplyMoney(moneyResult.value, -2);
        expect(resultOrError.success).toBe(false);
        if (!resultOrError.success) {
          expect(resultOrError.error.type).toBe('NEGATIVE_MULTIPLIER');
        }
      }
    });

    test('小数を乗算するとエラーになる', () => {
      const moneyResult = createMoney(100);

      expect(moneyResult.success).toBe(true);

      if (moneyResult.success) {
        const resultOrError = multiplyMoney(moneyResult.value, 1.5);
        expect(resultOrError.success).toBe(false);
        if (!resultOrError.success) {
          expect(resultOrError.error.type).toBe('NON_INTEGER_MULTIPLIER');
        }
      }
    });
  });
});
