import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * データベース接続の設定
 */
export type DatabaseConfig = {
  readonly filename: string;
  readonly readonly?: boolean;
  readonly create?: boolean;
};

/**
 * SQLiteデータベース接続を作成
 */
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

/**
 * マイグレーション実行
 */
export const runMigrations = (db: Database): void => {
  const schemaPath = join(import.meta.dir, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // スキーマを実行
  db.exec(schema);
};

/**
 * テスト用のインメモリデータベースを作成
 */
export const createTestDatabase = (): Database => {
  const db = createDatabase({ filename: ':memory:' });
  runMigrations(db);
  return db;
};

/**
 * 本番用データベースを作成
 */
export const createProductionDatabase = (): Database => {
  const dbPath = process.env.DATABASE_PATH ?? join(process.cwd(), 'data', 'app.db');
  const db = createDatabase({ filename: dbPath });
  runMigrations(db);
  return db;
};
