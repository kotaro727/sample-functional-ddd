import { describe, test, expect } from 'bun:test';
import { isOk, isErr } from '@shared/functional/result';
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

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getMoney(result.value)).toBe(1000);
      }
    });

    test('0円のMoney値オブジェクトを作成できる', () => {
      const result = createMoney(0);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(getMoney(result.value)).toBe(0);
      }
    });

    test('負の金額ではMoney値オブジェクトを作成できない', () => {
      const result = createMoney(-100);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('NEGATIVE_AMOUNT');
        expect(result.error.message).toContain('0以上');
      }
    });

    test('小数を含む金額ではMoney値オブジェクトを作成できない', () => {
      const result = createMoney(100.5);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('NON_INTEGER_AMOUNT');
        expect(result.error.message).toContain('整数');
      }
    });
  });

  describe('addMoney', () => {
    test('2つのMoneyを加算できる', () => {
      const money1Result = createMoney(1000);
      const money2Result = createMoney(500);

      expect(isOk(money1Result)).toBe(true);
      expect(isOk(money2Result)).toBe(true);

      if (isOk(money1Result) && isOk(money2Result)) {
        const sum = addMoney(money1Result.value, money2Result.value);
        expect(getMoney(sum)).toBe(1500);
      }
    });

    test('0円を加算できる', () => {
      const money1Result = createMoney(1000);
      const money2Result = createMoney(0);

      expect(isOk(money1Result)).toBe(true);
      expect(isOk(money2Result)).toBe(true);

      if (isOk(money1Result) && isOk(money2Result)) {
        const sum = addMoney(money1Result.value, money2Result.value);
        expect(getMoney(sum)).toBe(1000);
      }
    });
  });

  describe('multiplyMoney', () => {
    test('Moneyを整数で乗算できる', () => {
      const moneyResult = createMoney(100);

      expect(isOk(moneyResult)).toBe(true);

      if (isOk(moneyResult)) {
        const resultOrError = multiplyMoney(moneyResult.value, 3);
        expect(isOk(resultOrError)).toBe(true);
        if (isOk(resultOrError)) {
          expect(getMoney(resultOrError.value)).toBe(300);
        }
      }
    });

    test('0を乗算すると0円になる', () => {
      const moneyResult = createMoney(100);

      expect(isOk(moneyResult)).toBe(true);

      if (isOk(moneyResult)) {
        const resultOrError = multiplyMoney(moneyResult.value, 0);
        expect(isOk(resultOrError)).toBe(true);
        if (isOk(resultOrError)) {
          expect(getMoney(resultOrError.value)).toBe(0);
        }
      }
    });

    test('負の数を乗算するとエラーになる', () => {
      const moneyResult = createMoney(100);

      expect(isOk(moneyResult)).toBe(true);

      if (isOk(moneyResult)) {
        const resultOrError = multiplyMoney(moneyResult.value, -2);
        expect(isErr(resultOrError)).toBe(true);
        if (isErr(resultOrError)) {
          expect(resultOrError.error.type).toBe('NEGATIVE_MULTIPLIER');
        }
      }
    });

    test('小数を乗算するとエラーになる', () => {
      const moneyResult = createMoney(100);

      expect(isOk(moneyResult)).toBe(true);

      if (isOk(moneyResult)) {
        const resultOrError = multiplyMoney(moneyResult.value, 1.5);
        expect(isErr(resultOrError)).toBe(true);
        if (isErr(resultOrError)) {
          expect(resultOrError.error.type).toBe('NON_INTEGER_MULTIPLIER');
        }
      }
    });
  });
});
