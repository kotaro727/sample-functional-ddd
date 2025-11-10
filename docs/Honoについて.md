# Honoについて

## 概要

**Hono（炎）**は、超高速で軽量なWebフレームワークです。Edge環境（Cloudflare Workers、Deno、Bun）でも動作し、TypeScriptファーストの設計により優れた開発体験を提供します。

このプロジェクトでは、Honoを使用してREST APIを構築しています。

### Honoの特徴

- **超高速**: ミドルウェアの実行が非常に高速
- **軽量**: バンドルサイズが小さい（約13KB）
- **マルチランタイム**: Cloudflare Workers、Deno、Bun、Node.jsで動作
- **TypeScript**: 完全な型安全性
- **Web標準**: Fetch APIをベースとした設計
- **豊富なミドルウェア**: CORS、JWT、Logger、など

### 公式リンク

- 公式サイト: https://hono.dev/
- GitHub: https://github.com/honojs/hono

## このプロジェクトでの使用パッケージ

```json
{
  "dependencies": {
    "hono": "^4.10.4",                    // Hono本体
    "@hono/node-server": "^1.19.6",       // Node.jsアダプター
    "@hono/swagger-ui": "^0.5.2",         // Swagger UI統合
    "@hono/zod-openapi": "^1.1.4",        // Zod + OpenAPI統合
    "zod": "^4.1.12"                      // バリデーションライブラリ
  }
}
```

## 基本的な使い方

### シンプルなアプリケーション

```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default app;
```

### ルーティング

```typescript
app.get('/users', (c) => c.json({ users: [] }));
app.post('/users', (c) => c.json({ message: 'Created' }, 201));
app.put('/users/:id', (c) => c.json({ message: 'Updated' }));
app.delete('/users/:id', (c) => c.json({ message: 'Deleted' }));
```

## このプロジェクトでの実装

### アプリケーションのセットアップ

`src/server.ts`:

```typescript
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';

export const createApp = (options: CreateAppOptions = {}) => {
  // OpenAPI対応のHonoインスタンスを作成
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      // バリデーションエラーのハンドリング
      if (!result.success) {
        return c.json(
          {
            error: {
              type: 'VALIDATION_ERROR',
              message: 'リクエストがスキーマに一致しません',
              issues: result.error.issues,
            },
          },
          400
        );
      }
    },
  });

  // CORSミドルウェアを適用
  app.use('*', cors());

  // リポジトリの依存性注入
  const productRepository = options.productRepository ?? createDummyJsonProductRepository();

  // ルーティングを登録
  app.route('/api', createProductRoutes(productRepository));

  // OpenAPIドキュメント
  app.doc('/doc', {
    openapi: '3.0.3',
    info: { title: 'Product API', version: '1.0.0' },
  });

  // Swagger UI
  app.get('/api-docs', swaggerUI({ url: '/doc' }));

  // 404ハンドリング
  app.notFound((c) => c.json({ error: 'Not Found' }, 404));

  // エラーハンドリング
  app.onError((err, c) => {
    if (err instanceof ZodError) {
      return c.json({ error: { type: 'VALIDATION_ERROR', issues: err.issues } }, 400);
    }
    console.error(err);
    return c.json({ error: { type: 'INTERNAL_SERVER_ERROR' } }, 500);
  });

  return app;
};
```

### ルーティングの定義

`src/presentation/api/routes/productRoutes.ts`:

```typescript
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

// DTOスキーマの定義（Zod）
const productDtoSchema = z
  .object({
    id: z.number().int().min(1).openapi({ example: 1, description: '商品ID' }),
    title: z.string().min(1).openapi({ example: 'iPhone 15', description: '商品名' }),
    price: z.number().nonnegative().openapi({ example: 999.99, description: '価格' }),
    description: z.string().nullable().optional().openapi({
      example: '最新のiPhone',
      description: '商品説明'
    }),
  })
  .openapi('ProductDto');

const errorResponseSchema = z
  .object({
    error: z.object({
      type: z.string().openapi({ example: 'NOT_FOUND' }),
      message: z.string().openapi({ example: '商品が見つかりません' }),
    }),
  })
  .openapi('ErrorResponse');

// ルート定義（OpenAPI準拠）
const getProductsRoute = createRoute({
  method: 'get',
  path: '/products',
  tags: ['products'],
  responses: {
    200: {
      description: '商品一覧の取得に成功',
      content: {
        'application/json': {
          schema: z.object({
            products: z.array(productDtoSchema),
          }),
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

const getProductByIdRoute = createRoute({
  method: 'get',
  path: '/products/{id}',
  tags: ['products'],
  request: {
    params: z.object({
      id: z.coerce.number().int().min(1).openapi({
        param: {
          name: 'id',
          in: 'path',
          required: true,
          description: '商品ID',
        },
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      description: '商品詳細の取得に成功',
      content: {
        'application/json': {
          schema: productDtoSchema,
        },
      },
    },
    404: {
      description: '商品が見つからない',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// ルーターの作成
export const createProductRoutes = (repository: ProductRepository) => {
  const router = new OpenAPIHono();
  const controller = createProductController(repository);

  // ルートとハンドラーを紐付け
  router.openapi(getProductsRoute, controller.getProducts);
  router.openapi(getProductByIdRoute, controller.getProductById);

  return router;
};
```

### コントローラーの実装

`src/presentation/api/controllers/productController.ts`:

```typescript
import type { Context } from 'hono';
import { ProductRepository } from '@application/ports/productRepository';
import { getProducts } from '@application/product/getProducts';
import { getProductById } from '@application/product/getProductById';
import { isOk } from '@shared/functional/result';

type JsonResponse = ReturnType<Context['json']>;

export type ProductController = {
  getProducts: (c: Context) => Promise<JsonResponse>;
  getProductById: (c: Context) => Promise<JsonResponse>;
};

export const createProductController = (repository: ProductRepository): ProductController => {
  return {
    /**
     * GET /products - 商品一覧を取得
     */
    getProducts: async (c: Context): Promise<JsonResponse> => {
      // Application層のユースケースを呼び出し
      const result = await getProducts(repository)();

      if (isOk(result)) {
        const productDtos = toProductDtoList(result.value);
        return c.json({ products: productDtos }, 200);
      }

      // エラーレスポンス
      return c.json(
        {
          error: {
            type: result.error.type,
            message: result.error.message,
          },
        },
        500
      );
    },

    /**
     * GET /products/:id - 商品詳細を取得
     */
    getProductById: async (c: Context): Promise<JsonResponse> => {
      const paramId = c.req.param('id');
      const id = Number.parseInt(paramId ?? '', 10);

      if (!Number.isFinite(id)) {
        return c.json(
          {
            error: {
              type: 'INVALID_PARAMETER',
              message: '無効な商品IDです',
            },
          },
          400
        );
      }

      // Application層のユースケースを呼び出し
      const result = await getProductById(repository)(id);

      if (isOk(result)) {
        const productDto = toProductDto(result.value);
        return c.json(productDto, 200);
      }

      // エラーの種類に応じたレスポンス
      if (result.error.type === 'NOT_FOUND') {
        return c.json(
          {
            error: {
              type: result.error.type,
              message: result.error.message,
            },
          },
          404
        );
      }

      return c.json(
        {
          error: {
            type: result.error.type,
            message: result.error.message,
          },
        },
        500
      );
    },
  };
};
```

## Zodによるバリデーション

### Zodとは

Zodは、TypeScriptファーストのスキーマ検証ライブラリです。型安全なバリデーションを提供します。

### 基本的な使い方

```typescript
import { z } from 'zod';

// スキーマ定義
const userSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0).max(150),
  email: z.string().email(),
});

// 型の自動推論
type User = z.infer<typeof userSchema>;
// { name: string; age: number; email: string; }

// バリデーション
const result = userSchema.safeParse({
  name: 'Taro',
  age: 25,
  email: 'taro@example.com',
});

if (result.success) {
  console.log(result.data);  // 型安全にアクセス
} else {
  console.error(result.error.issues);
}
```

### このプロジェクトでの使用

#### リクエストバリデーション

```typescript
// パスパラメータのバリデーション
const productIdParamsSchema = z.object({
  id: z
    .coerce.number()      // 文字列を数値に変換
    .int()                // 整数チェック
    .min(1)               // 最小値チェック
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
        description: '商品ID',
      },
      example: 1,
    }),
});
```

#### レスポンススキーマ

```typescript
// レスポンスの型定義
const productDtoSchema = z
  .object({
    id: z.number().int().min(1).openapi({
      example: 1,
      description: '商品ID'
    }),
    title: z.string().min(1).openapi({
      example: 'iPhone 15',
      description: '商品名'
    }),
    price: z.number().nonnegative().openapi({
      example: 999.99,
      description: '価格'
    }),
    description: z.string().nullable().optional().openapi({
      example: '最新のiPhone',
      description: '商品説明'
    }),
  })
  .openapi('ProductDto');

// TypeScript型の自動生成
type ProductDto = z.infer<typeof productDtoSchema>;
```

#### バリデーションエラーのハンドリング

```typescript
const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      // Zodのバリデーションエラーを整形して返す
      return c.json(
        {
          error: {
            type: 'VALIDATION_ERROR',
            message: 'リクエストがスキーマに一致しません',
            issues: result.error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          },
        },
        400
      );
    }
  },
});
```

## OpenAPI統合

### OpenAPIドキュメントの自動生成

Honoと`@hono/zod-openapi`を使うと、ルート定義から自動的にOpenAPIドキュメントが生成されます。

```typescript
// OpenAPIドキュメントエンドポイント
app.doc('/doc', {
  openapi: '3.0.3',
  info: {
    title: 'Product API',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'ローカル開発環境',
    },
  ],
  tags: [
    {
      name: 'products',
      description: '商品関連のAPI',
    },
  ],
});
```

### Swagger UIの提供

```typescript
import { swaggerUI } from '@hono/swagger-ui';

// Swagger UIエンドポイント
app.get('/api-docs', swaggerUI({ url: '/doc' }));
```

これにより、`http://localhost:3000/api-docs` でSwagger UIにアクセスできます。

### OpenAPIスキーマの活用

生成されたOpenAPIスキーマから、TypeScript型を自動生成できます:

```bash
# package.json
"scripts": {
  "openapi:generate": "openapi-typescript openapi/openapi.yaml -o src/generated/api-schema.ts"
}
```

## テスト

### Honoのテストクライアント

Honoは`testClient`という便利なテストユーティリティを提供しています。

`src/presentation/api/controllers/productController.test.ts`:

```typescript
import { describe, test, expect } from 'bun:test';
import { OpenAPIHono } from '@hono/zod-openapi';
import { testClient } from 'hono/testing';
import { createProductRoutes } from '@presentation/api/routes/productRoutes';

const createTestClient = (repository: ProductRepository) => {
  const app = new OpenAPIHono();
  app.route('/api', createProductRoutes(repository));
  return testClient(app);
};

describe('ProductController', () => {
  describe('GET /products', () => {
    test('商品一覧を取得して200を返す', async () => {
      // テスト用のリポジトリ（モック）
      const testRepository: ProductRepository = {
        findAll: async () => ok([product1, product2]),
        findById: async () => err({ type: 'NOT_FOUND', message: 'Not implemented' }),
      };

      // テストクライアント作成
      const client = createTestClient(testRepository);

      // APIリクエスト実行
      const response = await client.api.products.$get();
      const body = await response.json();

      // アサーション
      expect(response.status).toBe(200);
      expect(body.products).toBeDefined();
      expect(body.products.length).toBe(2);
      expect(body.products[0].id).toBe(1);
      expect(body.products[0].title).toBe('iPhone 15');
    });

    test('リポジトリエラー時は500を返す', async () => {
      const testRepository: ProductRepository = {
        findAll: async () => err({
          type: 'NETWORK_ERROR',
          message: 'ネットワークエラー'
        }),
        findById: async () => err({ type: 'NOT_FOUND', message: 'Not implemented' }),
      };

      const client = createTestClient(testRepository);
      const response = await client.api.products.$get();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBeDefined();
      expect(body.error.type).toBe('NETWORK_ERROR');
    });
  });

  describe('GET /products/:id', () => {
    test('商品詳細を取得して200を返す', async () => {
      const testRepository: ProductRepository = {
        findAll: async () => ok([]),
        findById: async (id: number) => {
          if (id === 1) {
            return ok(product1);
          }
          return err({ type: 'NOT_FOUND', message: '商品が見つかりません' });
        },
      };

      const client = createTestClient(testRepository);

      // パスパラメータを渡してリクエスト
      const response = await client.api.products[':id'].$get({
        param: { id: 1 }
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBe(1);
      expect(body.title).toBe('iPhone 15');
    });

    test('存在しない商品IDで404を返す', async () => {
      const testRepository: ProductRepository = {
        findAll: async () => ok([]),
        findById: async (id: number) => {
          return err({ type: 'NOT_FOUND', message: '商品が見つかりません' });
        },
      };

      const client = createTestClient(testRepository);
      const response = await client.api.products[':id'].$get({
        param: { id: 999 }
      });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBeDefined();
      expect(body.error.type).toBe('NOT_FOUND');
    });
  });
});
```

### テストのポイント

1. **依存性注入**: リポジトリをモックとして注入
2. **型安全なテストクライアント**: `testClient`で型安全にリクエスト
3. **Result型との組み合わせ**: `ok()`/`err()`でテストデータを作成
4. **ステータスコードとレスポンスの検証**: HTTPレスポンスを包括的にテスト

## ヘキサゴナルアーキテクチャとの統合

### 依存性の方向

```
Presentation (Hono) → Application → Domain
       ↓
Infrastructure (Ports実装)
```

### 依存性注入パターン

```typescript
// サーバー起動時に依存性を注入
export const createApp = (options: CreateAppOptions = {}) => {
  const app = new OpenAPIHono();

  // リポジトリの依存性注入
  const productRepository = options.productRepository ??
    createDummyJsonProductRepository();

  // ルーティングに依存性を渡す
  app.route('/api', createProductRoutes(productRepository));

  return app;
};

// テスト時にはモックを注入
const app = createApp({
  productRepository: mockRepository
});
```

### Application層との境界

コントローラーは、Application層のユースケースを呼び出すだけの薄い層です:

```typescript
export const createProductController = (repository: ProductRepository) => {
  return {
    getProducts: async (c: Context) => {
      // Application層のユースケース呼び出し
      const result = await getProducts(repository)();

      // Result型からHTTPレスポンスへ変換
      if (isOk(result)) {
        return c.json({ products: toProductDtoList(result.value) }, 200);
      }
      return c.json({ error: result.error }, 500);
    },
  };
};
```

## ミドルウェア

### CORS

```typescript
import { cors } from 'hono/cors';

app.use('*', cors());

// カスタム設定
app.use('*', cors({
  origin: 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
```

### カスタムミドルウェア

```typescript
// ロギングミドルウェア
app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});

// 認証ミドルウェア
app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
```

## 開発・本番環境

### 開発環境

```bash
# package.json
"scripts": {
  "dev:api": "bun run --watch src/index.ts"
}
```

`src/index.ts`:

```typescript
import { serve } from '@hono/node-server';
import { createApp } from './server';

const app = createApp();

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

### 本番環境

```typescript
// Cloudflare Workers
export default app;

// Vercel
export const GET = app.fetch;
export const POST = app.fetch;

// Node.js
serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
});
```

## ベストプラクティス

### 1. ルート定義を分離

```typescript
// Good: ルート定義とハンドラーを分離
const route = createRoute({ ... });
router.openapi(route, handler);

// Bad: 混在させない
router.get('/products', (c) => { ... });
router.openapi(getProductsRoute, (c) => { ... });
```

### 2. バリデーションスキーマの再利用

```typescript
// Good: スキーマを定数として定義
const productDtoSchema = z.object({ ... }).openapi('ProductDto');

// 複数のルートで再利用
const getRoute = createRoute({
  responses: {
    200: { content: { 'application/json': { schema: productDtoSchema } } }
  }
});

const listRoute = createRoute({
  responses: {
    200: { content: { 'application/json': { schema: z.array(productDtoSchema) } } }
  }
});
```

### 3. エラーハンドリングの統一

```typescript
// Good: エラーレスポンスを統一
const errorResponseSchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
  }),
}).openapi('ErrorResponse');

// すべてのエラーレスポンスでこのスキーマを使用
```

### 4. 依存性注入

```typescript
// Good: 依存性を注入可能にする
export const createProductRoutes = (repository: ProductRepository) => {
  const router = new OpenAPIHono();
  // ...
  return router;
};

// Bad: 内部で直接インスタンス化
const repository = createDummyJsonProductRepository();
```

### 5. Result型との統合

```typescript
// Good: Result型でエラーハンドリング
const result = await getProducts(repository)();
if (isOk(result)) {
  return c.json({ products: result.value }, 200);
}
return c.json({ error: result.error }, 500);

// Bad: try-catchに頼る
try {
  const products = await getProducts();
  return c.json({ products }, 200);
} catch (error) {
  return c.json({ error: 'Unknown error' }, 500);
}
```

## まとめ

このプロジェクトでは、Honoを使用して:

1. **型安全なAPI**: Zodスキーマとの統合により、リクエスト・レスポンスが型安全
2. **自動ドキュメント生成**: OpenAPI準拠のドキュメントが自動生成される
3. **テスタビリティ**: `testClient`により簡潔にテストを記述できる
4. **依存性注入**: リポジトリを注入可能にし、テストとプロダクションで切り替え可能
5. **ヘキサゴナルアーキテクチャ**: Application層とPresentation層を明確に分離
6. **Result型との統合**: 関数型エラーハンドリングとHTTPレスポンスを自然に変換

Honoの軽量性と型安全性により、保守性の高いREST APIを構築できています。

## 関連項目

- [Result型について.md](./Result型について.md) - Result型との統合
- [Pipe関数について.md](./Pipe関数について.md) - 関数合成
- `src/server.ts` - Honoアプリケーションのセットアップ
- `src/presentation/api/routes/` - ルート定義
- `src/presentation/api/controllers/` - コントローラー実装
- `CLAUDE.md` - プロジェクト全体のアーキテクチャ
