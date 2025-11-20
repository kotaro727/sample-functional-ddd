import { describe, test, expect, beforeEach } from 'bun:test';
import { InMemoryInventoryService } from './inMemoryInventoryService';
import { isOk, isErr } from '@shared/functional/result';

describe('InMemoryInventoryService', () => {
  let inventoryService: InMemoryInventoryService;

  beforeEach(() => {
    // 初期在庫: 商品ID 1 = 100個, 商品ID 2 = 50個
    inventoryService = new InMemoryInventoryService({
      1: 100,
      2: 50,
    });
  });

  describe('decrease', () => {
    test('在庫を減らすことができる', async () => {
      // Act
      const result = await inventoryService.decrease(1, 10);

      // Assert
      expect(isOk(result)).toBe(true);

      // 在庫が減っていることを確認
      const stockResult = await inventoryService.getStock(1);
      expect(isOk(stockResult)).toBe(true);
      if (isOk(stockResult)) {
        expect(stockResult.value.quantity).toBe(90);
      }
    });

    test('在庫が不足している場合はエラーになる', async () => {
      // Act
      const result = await inventoryService.decrease(1, 150);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('INSUFFICIENT_STOCK');
      }

      // 在庫は変わっていないことを確認
      const stockResult = await inventoryService.getStock(1);
      if (isOk(stockResult)) {
        expect(stockResult.value.quantity).toBe(100);
      }
    });

    test('存在しない商品の在庫を減らすとエラーになる', async () => {
      // Act
      const result = await inventoryService.decrease(999, 10);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
      }
    });

    test('複数回減らすことができる', async () => {
      // Act
      await inventoryService.decrease(1, 20);
      await inventoryService.decrease(1, 30);

      // Assert
      const stockResult = await inventoryService.getStock(1);
      if (isOk(stockResult)) {
        expect(stockResult.value.quantity).toBe(50);
      }
    });
  });

  describe('increase', () => {
    test('在庫を増やすことができる', async () => {
      // Act
      const result = await inventoryService.increase(1, 50);

      // Assert
      expect(isOk(result)).toBe(true);

      // 在庫が増えていることを確認
      const stockResult = await inventoryService.getStock(1);
      if (isOk(stockResult)) {
        expect(stockResult.value.quantity).toBe(150);
      }
    });

    test('存在しない商品の在庫を増やすとエラーになる', async () => {
      // Act
      const result = await inventoryService.increase(999, 10);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
      }
    });
  });

  describe('getStock', () => {
    test('在庫数を取得できる', async () => {
      // Act
      const result = await inventoryService.getStock(1);

      // Assert
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.productId).toBe(1);
        expect(result.value.quantity).toBe(100);
      }
    });

    test('存在しない商品の在庫を取得するとエラーになる', async () => {
      // Act
      const result = await inventoryService.getStock(999);

      // Assert
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
      }
    });
  });
});
