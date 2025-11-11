import { describe, test, expect, beforeEach } from 'bun:test';
import { createTestDatabase } from '@infrastructure/persistence/database/connection';
import { createSqliteProductRepository } from './sqliteProductRepository';
import { createProduct } from '@domain/product/product';
import { isOk, isErr } from '@shared/functional/result';
import type { Database } from 'bun:sqlite';

describe('SqliteProductRepository', () => {
  let db: Database;
  let repository: ReturnType<typeof createSqliteProductRepository>;

  beforeEach(() => {
    // 各テストで新しいインメモリDBを作成
    db = createTestDatabase();
    repository = createSqliteProductRepository(db);
  });

  describe('findAll', () => {
    test('空のデータベースで空配列を返す', async () => {
      const result = await repository.findAll();

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.length).toBe(0);
      }
    });

    test('保存した商品を全て取得できる', async () => {
      // テストデータを作成
      const product1Result = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });
      const product2Result = createProduct({
        id: 2,
        title: 'MacBook Pro',
        price: 2499.99,
        description: '高性能ノートPC',
      });

      expect(isOk(product1Result)).toBe(true);
      expect(isOk(product2Result)).toBe(true);

      if (!isOk(product1Result) || !isOk(product2Result)) {
        throw new Error('テストデータの作成に失敗');
      }

      // 商品を保存
      await repository.save!(product1Result.value);
      await repository.save!(product2Result.value);

      // 全商品を取得
      const result = await repository.findAll();

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.length).toBe(2);
        expect(result.value[0].id.value).toBe(1);
        expect(result.value[0].title).toBe('iPhone 15');
        expect(result.value[1].id.value).toBe(2);
        expect(result.value[1].title).toBe('MacBook Pro');
      }
    });
  });

  describe('findById', () => {
    test('存在する商品IDで商品を取得できる', async () => {
      const productResult = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isOk(productResult)).toBe(true);
      if (!isOk(productResult)) {
        throw new Error('テストデータの作成に失敗');
      }

      // 商品を保存
      await repository.save!(productResult.value);

      // IDで取得
      const result = await repository.findById(1);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.id.value).toBe(1);
        expect(result.value.title).toBe('iPhone 15');
        expect(result.value.price.value).toBe(999.99);
        expect(result.value.description).toBe('最新のiPhone');
      }
    });

    test('存在しない商品IDでNOT_FOUNDエラーを返す', async () => {
      const result = await repository.findById(999);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });

  describe('save', () => {
    test('新しい商品を保存できる', async () => {
      const productResult = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isOk(productResult)).toBe(true);
      if (!isOk(productResult)) {
        throw new Error('テストデータの作成に失敗');
      }

      // 商品を保存
      const saveResult = await repository.save!(productResult.value);

      expect(isOk(saveResult)).toBe(true);
      if (isOk(saveResult)) {
        expect(saveResult.value.id.value).toBe(1);
        expect(saveResult.value.title).toBe('iPhone 15');
      }

      // 保存されたか確認
      const findResult = await repository.findById(1);
      expect(isOk(findResult)).toBe(true);
    });

    test('既存の商品を更新できる', async () => {
      // 最初に商品を保存
      const originalResult = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isOk(originalResult)).toBe(true);
      if (!isOk(originalResult)) {
        throw new Error('テストデータの作成に失敗');
      }

      await repository.save!(originalResult.value);

      // 同じIDで異なる内容の商品を作成
      const updatedResult = createProduct({
        id: 1,
        title: 'iPhone 15 Pro',
        price: 1199.99,
        description: 'プロモデル',
      });

      expect(isOk(updatedResult)).toBe(true);
      if (!isOk(updatedResult)) {
        throw new Error('テストデータの作成に失敗');
      }

      // 更新
      const saveResult = await repository.save!(updatedResult.value);

      expect(isOk(saveResult)).toBe(true);
      if (isOk(saveResult)) {
        expect(saveResult.value.title).toBe('iPhone 15 Pro');
        expect(saveResult.value.price.value).toBe(1199.99);
        expect(saveResult.value.description).toBe('プロモデル');
      }

      // データベースに1件のみ存在することを確認
      const allResult = await repository.findAll();
      expect(isOk(allResult)).toBe(true);
      if (isOk(allResult)) {
        expect(allResult.value.length).toBe(1);
      }
    });
  });

  describe('delete', () => {
    test('存在する商品を削除できる', async () => {
      const productResult = createProduct({
        id: 1,
        title: 'iPhone 15',
        price: 999.99,
        description: '最新のiPhone',
      });

      expect(isOk(productResult)).toBe(true);
      if (!isOk(productResult)) {
        throw new Error('テストデータの作成に失敗');
      }

      // 商品を保存
      await repository.save!(productResult.value);

      // 削除
      const deleteResult = await repository.delete!(1);

      expect(isOk(deleteResult)).toBe(true);

      // 削除されたか確認
      const findResult = await repository.findById(1);
      expect(isErr(findResult)).toBe(true);
      if (isErr(findResult)) {
        expect(findResult.error.type).toBe('NOT_FOUND');
      }
    });

    test('存在しない商品IDでNOT_FOUNDエラーを返す', async () => {
      const result = await repository.delete!(999);

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });
});
