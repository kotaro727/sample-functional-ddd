# Hono移行設計書

## 1. 背景と目的
- 現行のAPIサーバーはExpress (`src/server.ts`) を基盤にCORS、JSONパーサー、Swagger UI、`express-openapi-validator` を組み合わせて構築している。
- フロントエンド（React）向けのAPI境界はシンプル (`GET /api/products`, `GET /api/products/:id`) だが、今後のエンドポイント拡張とエッジ/サーバーレス対応を見据えて軽量なHonoへ移行したい。
- Hono採用により、以下を狙う:
  - ルータ性能とDXの向上（型安全なContext・ハンドラーシグネチャ）
  - Node/Bun/Edgeのマルチランタイム展開
  - OpenAPIとの親和性が高い`@hono/openapi`等のエコシステム利用

## 2. 現行構成サマリ
| レイヤ | 役割 | 主要ファイル |
| --- | --- | --- |
| Presentation(API) | ExpressでHTTP層を実装。ルート: `src/presentation/api/routes/productRoutes.ts`、Controller: `src/presentation/api/controllers/productController.ts`。 | see files |
| Application | ユースケース（`getProducts`, `getProductById`）とポート (`ProductRepository`) | `src/application/product/*.ts`, `src/application/ports/productRepository.ts` |
| Infrastructure | DummyJSONリポジトリで外部API接続 | `src/infrastructure/external/dummyJsonProductRepository.ts` |
| API基盤 | `src/server.ts` でExpressインスタンス作成、OpenAPI Validator / Swagger登録 | `src/server.ts` |

Express固有要素:
- `express()` + `app.use(express.json())`
- `cors`ミドルウェア
- `swagger-ui-express` + OpenAPI YAML読込
- `express-openapi-validator` (request/response validation)
- Express固有のエラーハンドラー (4引数ミドルウェア)

## 3. Hono採用方針
| 項目 | 方針 |
| --- | --- |
| ランタイム | 当面はNode/Bunで `@hono/node-server` を利用。将来的にEdge移行可能な構成を保つ。 |
| ルーティング | `new Hono()` をルートアプリとし、`app.route('/api', productRouter)` でサブルータを構築。 |
| ミドルウェア | `app.use('*', cors())`, `app.use('*', logger())`, JSONボディはHono標準 (`req.json()`) を使用。 |
| バリデーション | `@hono/openapi` + `@hono/zod-validator` を検討。既存OpenAPI YAMLをソースオブトゥルースに保ち、`openapi-typescript`との整合を維持。 |
| Swagger UI | `@hono/swagger-ui` で `/api-docs` を提供。既存のYAMLを配信しつつ、HonoのOpenAPI DSLで将来的に自動生成も許容。 |
| エラーハンドリング | Honoの`app.onError`/`app.notFound` を使用。`Result`型エラーをHTTPへマッピングする共通ヘルパーを作成。 |
| DI | 既存のControllerファクトリ/Repositoryファクトリを再利用。Hono ContextにDIをぶら下げず、ハンドラー内でクロージャ注入。 |

## 4. 影響範囲
- `package.json` / `bun.lock`: Express系依存削除、Hono関連追加 (`hono`, `@hono/node-server`, `@hono/cors`, `@hono/swagger-ui`, `@hono/openapi`).
- `src/server.ts`: Express実装をHono初期化に書き換え。
- `src/presentation/api/routes/*`: Express RouterからHonoの`Hono`サブルータへ移植。
- `src/presentation/api/controllers/*`: `Request`/`Response`型依存を排除し、Hono Context互換の薄いアダプター層を追加。
- OpenAPI/Validator: `express-openapi-validator` を廃止し、`@hono/openapi` または `zod-openapi` + `@hono/zod-validator` へ移行。
- テスト: `supertest`ベースのHTTPテストを、`@hono/node-server` + `supertest` または Honoの`app.request`で置換。
- Docs: `CLAUDE.md`, `CONTRACT_DRIVEN_DEVELOPMENT.md`, `EXPRESS_USAGE.md` を更新しHono版ガイドを追記/差し替え。

## 5. 設計詳細
### 5.1 アプリケーションブートストラップ
```ts
// src/server.ts (新構成イメージ)
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { validator } from './presentation/api/middleware/openApiValidator';
import { createProductRoutes } from './presentation/api/routes/productRoutes';

export const createApp = () => {
  const app = new Hono();
  app.use('*', cors());
  app.get('/api-docs', swaggerUI({ url: '/openapi.yaml' }));
  app.route('/api', createProductRoutes());
  app.onError((err, c) => toHttpErrorResponse(err, c));
  app.notFound((c) => c.json({ error: 'Not Found' }, 404));
  return app;
};

if (import.meta.main) {
  const app = createApp();
  serve({ fetch: app.fetch, port: 4000 });
}
```
- `createDummyJsonProductRepository` 等の依存注入は `createProductRoutes` で実施。Hono Contextに直接注入しない。
- `toHttpErrorResponse` はResultエラーとOpenAPIバリデーションエラーをHTTPレスポンスへ変換する共通関数。

### 5.2 ミドルウェア対応表
| Express | Hono対応 | 備考 |
| --- | --- | --- |
| `app.use(cors())` | `app.use('*', cors())` (from `hono/cors`) | 設定値も移設。 |
| `app.use(express.json())` | 不要 (`req.json()` 利用) | Honoは`Request`標準API。 |
| `swagger-ui-express` | `@hono/swagger-ui` | 既存YAML URLを渡す。 |
| `express-openapi-validator` | `@hono/openapi` + `zod` or `hono-openapi` | リクエスト/レスポンス双方を検証する場合は`validateResponse`ユーティリティ実装が必要。 |
| カスタムエラーハンドラー | `app.onError`, `app.notFound` | Resultエラー種別をHTTPステータスへ変換する関数を共通化。 |

### 5.3 ルーティング / コントローラー
- 現行ControllerはExpressの`Request/Response`に依存。移行案:
  1. **アダプター層追加**: `src/presentation/api/controllers/productController.ts`にHono Contextを受け取る薄いハンドラーを追加し、既存関数を内部で呼び出す。
  2. **Honoネイティブ書き直し**: Contextからパラメータを取得し `getProducts`/`getProductById` を呼ぶ関数へ刷新。Express専用型を排除。
- ルータ定義イメージ:
```ts
export const createProductRoutes = (repository = createDummyJsonProductRepository()) => {
  const router = new Hono();
  const controller = createProductController(repository);

  router.get('/products', controller.getProducts);
  router.get('/products/:id', controller.getProductById);

  return router;
};
```

### 5.4 バリデーション/Swagger
- **最優先案**: `@hono/openapi` を導入し、`defineOpenAPI({ doc: openapiDocument })` で既存YAMLを取り込みつつ、ルートに`createRoute()`を付与して型安全なRequest/Responseスキーマを定義。
- **互換案**: `express-openapi-validator` の代替として `openapi-enforcer` + カスタムミドルウェアをHonoに組み込む。必要に応じて検証結果をResult型へ変換。
- Swagger UIは `/api-docs` にYAMLを返すため、`app.get('/openapi.yaml', serveStatic(...))` or `c.newResponse(yamlContent)` を追加。

### 5.5 テスト戦略
- `supertest(app)` のExpress依存を外し、`app.request()`（Honoが提供するFetch互換API）を使った統合テストに切り替える。
- 既存の `productController.test.ts` は、Honoルーターを`createApp().fetch`へリクエストする形に修正。
- バリデーションテストでは、OpenAPI違反のリクエストを投げて`VALIDATION_ERROR`レスポンスを検証。

## 6. マイグレーション手順
1. **依存関係準備**
   - `bun add hono @hono/node-server hono/cors @hono/swagger-ui @hono/openapi`
   - Express関連（`express`, `express-openapi-validator`, `swagger-ui-express`）は後段で削除。
2. **サイドバイサイド実装**
   - `src/server.hono.ts` を新規作成し、Hono版`createApp`を実装。
   - 既存Express版と並行で起動できるよう、開発スクリプトに `dev:api:hono` を追加。
3. **ルーター/コントローラー移行**
   - `productRoutes` をHono版へ置換し、テストを更新。
   - Controllerのシグネチャ変更（`Request/Response`除去）。
4. **OpenAPI連携**
   - `@hono/openapi` ベースのバリデーション/Swagger組み込み。
   - `CONTRACT_DRIVEN_DEVELOPMENT.md` の手順をHono向けに更新。
5. **クリーンアップ**
   - Express依存・ミドルウェア削除。
   - `EXPRESS_USAGE.md` をアーカイブ or `Hono_USAGE.md` へ置換。
6. **本番切替**
   - サーバーエントリーポイントをHono版へ変更 (`dev:api`, `start` スクリプト)。
   - ドキュメント/READMEを更新し、Expressに関する記述を整理。

## 7. リスクと対応策
| リスク | 対応 |
| --- | --- |
| OpenAPIバリデーションの互換性低下 | `express-openapi-validator`と同等のR/R検証を `@hono/openapi` + カスタムレスポンスバリデータで補完。必要なら`hono-openapi-validator`などOSSを評価。 |
| Controllerシグネチャ変更による影響 | Controllerを純粋関数化し、HTTP層アダプターでHono Contextを扱うことで最小限の改修に抑える。 |
| テストの大規模修正 | `app.request`を用いることで`supertest`不使用でもHTTPレベルを担保。段階的にテストを書き換える。 |
| Swagger UI提供方法 | `@hono/swagger-ui`に乗り換えるが、必要に応じて`swagger-ui-dist`を静的配信するバックアップを用意。 |

## 8. 未決事項 / TODO
- OpenAPI連携方式の最終決定（`@hono/openapi` vs 独自ミドルウェア）。
- Edge配備（Cloudflare Workers等）を視野に入れるかどうか。
- 既存Expressドキュメントの扱い（併存か全面置換か）。
- 新しいテストユーティリティ（`hono/testing`）の導入要否。

---
この設計書をベースに、依存追加→サイドバイサイド実装→検証→切替の順で移行を進める。
