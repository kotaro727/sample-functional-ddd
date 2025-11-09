# Expressの抽象と具体

## 抽象: Expressの基本構造
- **アプリケーションインスタンス (`express()`):** HTTPサーバーのエントリーポイントで、ミドルウェアやルートを登録する。`app.use`でグローバルミドルウェア、`app.get/post`でハンドラーを追加する。
- **ミドルウェアチェーン:** `req`/`res`/`next`を受け取り、リクエスト処理の途中で共通処理（認証、ロギング、バリデーション等）を挟める。順序が重要で、`next()`の呼び出しで次のミドルウェアへ進む。
- **ルーター (`Router()`):** ミニアプリとして機能し、ドメインごとのルートやミドルウェアを分割管理できる。`app.use('/prefix', router)`でマウントする。
- **Controller層:** ルーターが呼び出すビジネスロジックの入り口。`Request`からパラメータを取り出し、アプリケーションサービスに委譲し、`Response`へ結果を返却する。
- **エラーハンドリング:** シグネチャ `(err, req, res, next)` のミドルウェアで集中処理。404などのフォールバックハンドラーも最後に配置する。
- **テスト:** `supertest`などを使って`express()`インスタンスに対しHTTPレベルの振る舞いを検証するのが一般的。

## 具体: sample-functional-dddでのExpress利用
1. **サーバー初期化 (`src/server.ts`):**
   ```ts
   export const createApp = (): Express => {
     const app = express();
     app.use(cors());
     app.use(express.json());
     // OpenAPI UI とバリデーション
     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
     app.use(OpenApiValidator.middleware({ apiSpec: openapiPath, validateRequests: true, validateResponses: true }));
     app.use('/api', createProductRoutes(productRepository));
     return app;
   };
   ```
   - `express()`でアプリを生成し、共通ミドルウェア（CORS、JSONパーサー）を登録。
   - `swagger-ui-express`と`express-openapi-validator`を組み合わせ、API仕様の提供と自動バリデーションを実現。
   - 依存性注入: `createDummyJsonProductRepository()`でインフラ層の実装を選択し、ルート作成時に渡す。

2. **ルーティング (`src/presentation/api/routes/productRoutes.ts`):**
   - `Router()`で商品用ルートを定義し、`GET /api/products`と`GET /api/products/:id`を設定。
   - ルーター内でControllerを生成してメソッドをバインドし、`app.use('/api', router)`でマウントすることでURLプレフィックスを統一。

3. **Controller層 (`src/presentation/api/controllers/productController.ts`):**
   - `Request`からクエリ/パスパラメータを取得し、アプリケーションサービス (`getProducts`, `getProductById`) を呼び出す薄い層。
   - 成功時はDTO変換 (`toProductDto*`) を経て`res.json`でレスポンス。ドメインエラーはHTTPステータス（400/404/500）へマッピング。
   - `isNaN`チェックや`result.error.type`による分岐でHTTPレベルの責務を集約。

4. **バリデーション&エラー処理 (`src/server.ts`):**
   - OpenAPI Validatorがリクエスト/レスポンスを自動検証し、失敗時には専用エラーハンドラーが`VALIDATION_ERROR`レスポンスを返す。
   - 最後段に404ハンドラーを置き、未定義ルートをJSONで統一的に返却。

5. **テスト (`src/presentation/api/controllers/productController.test.ts`):**
   - `express()`をその場で生成し、コントローラーをマウントして`supertest`でHTTPレスポンスを検証。
   - 実際のルーティング構造を介さず、Controller単体の挙動を迅速に確認するスタイル。

6. **開発フローとの接続:**
   - `docs/CONTRACT_DRIVEN_DEVELOPMENT.md`にある契約駆動開発のプロセスで定義されたOpenAPI仕様を、`swagger-ui-express`＋`express-openapi-validator`で即座にサーバーへ反映。
   - Express層はAPI仕様とアプリケーションサービスの橋渡しに限定され、DDDの境界（presentation/application/domain）を明確に保つ。

このドキュメントを出発点に、OpenAPI仕様や新規エンドポイントを追加する際は同じ流れ（仕様→ルート→Controller→アプリケーションサービス）で実装すると、Expressの責務をシンプルに維持できます。
