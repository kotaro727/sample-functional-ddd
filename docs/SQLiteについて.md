# SQLiteについて

## 概要

このプロジェクトでは、永続化層として**SQLite**を使用しています。SQLiteは軽量で高速なリレーショナルデータベースで、サーバーレスで動作します。

Bunには**SQLiteがビルトインされている**ため、追加のインストールは不要です。

## なぜSQLiteを選んだのか

### 1. サーバーレス

```typescript
// サーバープロセスが不要
const db = new Database('app.db');
// これだけで使える
```

- データベースサーバーの起動・管理が不要
- ファイルベースで動作
- 開発環境のセットアップが簡単

### 2. 軽量・高速

- メモリフットプリントが小さい
- 読み取りが非常に高速
- 小規模〜中規模のアプリケーションに最適

### 3. Bunにビルトイン

```typescript
import { Database } from 'bun:sqlite';
// 追加のnpm installは不要
```

### 4. ACID準拠

- トランザクション対応
- データの整合性が保証される
- 本格的なリレーショナルデータベース

## このプロジェクトでの構成

### ディレクトリ構造

```
src/infrastructure/persistence/
├── database/
│   ├── schema.sql              # データベーススキーマ定義
│   └── connection.ts           # DB接続とマイグレーション
└── repositories/
    ├── sqliteProductRepository.ts       # SQLite実装
    └── sqliteProductRepository.test.ts  # テスト

data/
└── app.db                      # 本番用データベースファイル（.gitignore）
```

### データベーススキーマ

`src/infrastructure/persistence/database/schema.sql`:

```sql
-- Product テーブル
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  price REAL NOT NULL CHECK(price >= 0),
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
```

**特徴:**
- `INTEGER PRIMARY KEY`: 整数の主キー
- `CHECK(price >= 0)`: 制約でビジネスルールを強制
- `datetime('now')`: SQLiteの日時関数
- インデックスで検索を高速化

## データベース接続

### 接続の作成

`src/infrastructure/persistence/database/connection.ts`:

```typescript
import { Database } from 'bun:sqlite';

export const createDatabase = (config: DatabaseConfig): Database => {
  const db = new Database(config.filename, {
    readonly: config.readonly ?? false,
    create: config.create ?? true,
  });

  // WALモードを有効化（パフォーマンス向上）
  db.exec('PRAGMA journal_mode = WAL;');

  // 外部キー制約を有効化
  db.exec('PRAGMA foreign_keys = ON;');

  return db;
};
```

### WALモード

```typescript
db.exec('PRAGMA journal_mode = WAL;');
```

**WAL (Write-Ahead Logging)の利点:**
- 読み取りと書き込みが同時実行可能
- パフォーマンスが向上
- データ損失のリスクが低い

### マイグレーション

```typescript
export const runMigrations = (db: Database): void => {
  const schemaPath = join(import.meta.dir, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // スキーマを実行
  db.exec(schema);
};
```

**シンプルな仕組み:**
- `CREATE TABLE IF NOT EXISTS`: 既存テーブルは変更しない
- 本格的なマイグレーションツールも後で導入可能

### テスト用データベース

```typescript
export const createTestDatabase = (): Database => {
  const db = createDatabase({ filename: ':memory:' });
  runMigrations(db);
  return db;
};
```

**`:memory:`の利点:**
- インメモリDBで高速
- テストごとにクリーンな状態
- ファイルシステムを汚さない

## Repository実装

### SQLiteProductRepositoryの実装

`src/infrastructure/persistence/repositories/sqliteProductRepository.ts`:

```typescript
import type { Database } from 'bun:sqlite';
import type { ProductRepository } from '@application/ports/productRepository';

export const createSqliteProductRepository = (db: Database): ProductRepository => {
  return {
    findAll: async () => {
      const query = db.query<ProductRow, []>('SELECT * FROM products ORDER BY id');
      const rows = query.all();

      // 各行をドメインモデルに変換
      const products: Product[] = [];
      for (const row of rows) {
        const productResult = rowToProduct(row);
        if (productResult._tag === 'Err') {
          return productResult;
        }
        products.push(productResult.value);
      }

      return ok(products as readonly Product[]);
    },

    findById: async (id: number) => {
      const query = db.query<ProductRow, [number]>('SELECT * FROM products WHERE id = ?');
      const row = query.get(id);

      if (!row) {
        return err({ type: 'NOT_FOUND', message: `商品ID ${id} が見つかりません` });
      }

      return rowToProduct(row);
    },

    save: async (product: Product) => {
      const insertQuery = db.query(
        `INSERT INTO products (id, title, price, description)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           price = excluded.price,
           description = excluded.description,
           updated_at = datetime('now')`
      );

      insertQuery.run(
        product.id.value,
        product.title,
        product.price.value,
        product.description
      );

      return await createSqliteProductRepository(db).findById(product.id.value);
    },

    delete: async (id: number) => {
      const deleteQuery = db.query('DELETE FROM products WHERE id = ?');
      const result = deleteQuery.run(id);

      if (result.changes === 0) {
        return err({ type: 'NOT_FOUND', message: `商品ID ${id} が見つかりません` });
      }

      return ok(undefined);
    },
  };
};
```

### データベース行からドメインモデルへの変換

```typescript
type ProductRow = {
  id: number;
  title: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
};

const rowToProduct = (row: ProductRow): Result<Product, DatabaseError> => {
  // スマートコンストラクタでドメインモデルを作成
  const result = createProduct({
    id: row.id,
    title: row.title,
    price: row.price,
    description: row.description,
  });

  if (result._tag === 'Ok') {
    return ok(result.value);
  }

  // バリデーションエラーをデータベースエラーに変換
  return err({
    type: 'DATABASE_ERROR',
    message: `データベースから取得した値が不正です: ${result.error.message}`,
  });
};
```

**重要なポイント:**
- データベース行を直接返さない
- スマートコンストラクタでドメインモデルを作成
- バリデーションエラーは適切に変換
- 型安全性を保つ

## Bun SQLiteの基本的な使い方

### クエリの準備

```typescript
// 型パラメータで型安全に
const query = db.query<ResultType, ParamsType>('SELECT * FROM products WHERE id = ?');

// 例
const query = db.query<ProductRow, [number]>('SELECT * FROM products WHERE id = ?');
```

**型パラメータ:**
- 第1引数: 結果の型
- 第2引数: パラメータの型（配列）

### クエリの実行

```typescript
// 単一行を取得
const row = query.get(1);  // ProductRow | null

// 全行を取得
const rows = query.all();  // ProductRow[]

// 実行のみ（INSERT, UPDATE, DELETE）
const result = query.run(1);
console.log(result.changes);  // 影響を受けた行数
```

### プリペアドステートメント

```typescript
// パラメータをプレースホルダーで指定
const query = db.query('SELECT * FROM products WHERE id = ? AND price > ?');

// 実行時に値をバインド
const row = query.get(1, 100);
```

**利点:**
- SQLインジェクション対策
- パフォーマンス向上（クエリが再利用される）

### トランザクション

```typescript
db.transaction(() => {
  // 複数のクエリを実行
  db.query('INSERT INTO products ...').run(...);
  db.query('UPDATE inventory ...').run(...);

  // すべて成功するか、すべて失敗するか
})();
```

## テスト

### テストの基本構造

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { createTestDatabase } from '@infrastructure/persistence/database/connection';

describe('SqliteProductRepository', () => {
  let db: Database;
  let repository: ReturnType<typeof createSqliteProductRepository>;

  beforeEach(() => {
    // 各テストで新しいインメモリDBを作成
    db = createTestDatabase();
    repository = createSqliteProductRepository(db);
  });

  test('商品を保存して取得できる', async () => {
    const productResult = createProduct({
      id: 1,
      title: 'iPhone 15',
      price: 999.99,
      description: '最新のiPhone',
    });

    if (!isOk(productResult)) {
      throw new Error('テストデータの作成に失敗');
    }

    // 保存
    await repository.save!(productResult.value);

    // 取得
    const result = await repository.findById(1);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.title).toBe('iPhone 15');
    }
  });
});
```

### テストのポイント

1. **インメモリDB**: 各テストで新しいDBを作成
2. **Result型の検証**: `isOk`/`isErr`でエラーハンドリング
3. **ドメインモデル**: スマートコンストラクタでテストデータを作成

## パフォーマンス最適化

### 1. インデックスの活用

```sql
-- よく検索するカラムにインデックス
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
```

### 2. プリペアドステートメントの再利用

```typescript
// Good: クエリを再利用
const query = db.query('SELECT * FROM products WHERE id = ?');
for (const id of ids) {
  const row = query.get(id);
}

// Bad: 毎回クエリを作成
for (const id of ids) {
  const query = db.query('SELECT * FROM products WHERE id = ?');
  const row = query.get(id);
}
```

### 3. バッチ処理

```typescript
// トランザクションでまとめて処理
db.transaction(() => {
  const insertQuery = db.query('INSERT INTO products ...');

  for (const product of products) {
    insertQuery.run(...);
  }
})();
```

### 4. WALモードの活用

```typescript
// 読み取りと書き込みが同時実行可能
db.exec('PRAGMA journal_mode = WAL;');
```

## エラーハンドリング

### データベースエラーの種類

```typescript
export type RepositoryError =
  | { type: 'DATABASE_ERROR'; message: string }
  | { type: 'NOT_FOUND'; message: string };
```

### エラーハンドリングのパターン

```typescript
try {
  const query = db.query('SELECT * FROM products');
  const rows = query.all();

  // ドメインモデルへの変換でエラーが発生する可能性
  for (const row of rows) {
    const productResult = rowToProduct(row);
    if (productResult._tag === 'Err') {
      return productResult;  // エラーを伝播
    }
  }

  return ok(products);
} catch (error) {
  // SQLiteエラーをキャッチしてResult型に変換
  return err({
    type: 'DATABASE_ERROR',
    message: `商品一覧の取得に失敗しました: ${error}`,
  });
}
```

## ベストプラクティス

### 1. ドメインモデルとDBモデルを分離

```typescript
// Good: 明確に分離
type ProductRow = {  // データベースの行
  id: number;
  title: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
};

type Product = {  // ドメインモデル
  id: ProductId;
  title: string;
  price: Price;
  description: string;
};

// Bad: 混在させる
type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  created_at: string;  // ドメインに不要な情報
};
```

### 2. スマートコンストラクタでバリデーション

```typescript
// データベースから取得した値もバリデーション
const rowToProduct = (row: ProductRow): Result<Product, DatabaseError> => {
  return createProduct({  // スマートコンストラクタ
    id: row.id,
    title: row.title,
    price: row.price,
    description: row.description,
  });
};
```

### 3. Result型で一貫したエラーハンドリング

```typescript
// すべてのRepository操作はResult型を返す
findAll: () => Promise<Result<readonly Product[], RepositoryError>>;
findById: (id: number) => Promise<Result<Product, RepositoryError>>;
save: (product: Product) => Promise<Result<Product, RepositoryError>>;
delete: (id: number) => Promise<Result<void, RepositoryError>>;
```

### 4. トランザクションで整合性を保つ

```typescript
// 複数の操作はトランザクションで
db.transaction(() => {
  deleteOldProducts();
  insertNewProducts();
})();
```

### 5. テストはインメモリDBで

```typescript
// 各テストで新しいDBを作成
beforeEach(() => {
  db = createTestDatabase();  // :memory:
  repository = createSqliteProductRepository(db);
});
```

## 本番環境での使用

### データベースファイルの配置

```typescript
// 環境変数で設定可能
const dbPath = process.env.DATABASE_PATH ?? join(process.cwd(), 'data', 'app.db');
const db = createDatabase({ filename: dbPath });
```

### バックアップ

```bash
# SQLiteデータベースのバックアップ
cp data/app.db data/app.db.backup

# または
sqlite3 data/app.db ".backup data/app.db.backup"
```

### マイグレーション（将来的に）

現在はシンプルな`CREATE TABLE IF NOT EXISTS`を使用していますが、本格的なマイグレーションツールも導入可能です：

- [bun-migrate](https://github.com/princejoogie/bun-migrate)
- カスタムマイグレーションスクリプト

## まとめ

このプロジェクトでは、SQLiteを使用して：

1. **軽量・高速**: サーバーレスで動作、セットアップ不要
2. **型安全**: BunのSQLiteでTypeScriptの型を活用
3. **ドメインモデル分離**: データベース行とドメインモデルを明確に分離
4. **Result型**: 一貫したエラーハンドリング
5. **テスタビリティ**: インメモリDBで高速なテスト
6. **ヘキサゴナルアーキテクチャ**: Repositoryパターンで抽象化

SQLiteは小規模〜中規模のアプリケーションに最適で、このプロジェクトの学習目的にも適しています。将来的にPostgreSQLなどに移行する場合も、Repositoryパターンにより影響を最小限にできます。

## 関連項目

- [公式ドキュメント](https://bun.com/docs/runtime/sql)
- [スマートコンストラクタパターンについて.md](./スマートコンストラクタパターンについて.md) - ドメインモデルの作成
- [Result型について.md](./Result型について.md) - エラーハンドリング
- `src/infrastructure/persistence/database/` - データベース接続とスキーマ
- `src/infrastructure/persistence/repositories/` - Repository実装
- `CLAUDE.md` - プロジェクト全体のアーキテクチャ
