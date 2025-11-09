# 契約駆動開発 (Contract-Driven Development)

このプロジェクトでは、OpenAPIを使用した契約駆動開発を採用しています。

## 概要

契約駆動開発とは、APIの「契約」（インターフェース仕様）を先に定義し、その契約に基づいてフロントエンドとバックエンドを並行開発する手法です。

### メリット

1. **型安全性**: OpenAPIスキーマからTypeScript型を自動生成
2. **ドキュメント自動生成**: Swagger UIで常に最新のAPIドキュメントを提供
3. **バリデーション**: リクエスト/レスポンスが自動的にスキーマ検証される
4. **並行開発**: フロントエンドとバックエンドが独立して開発可能
5. **テスト容易性**: 契約に基づいたテストが書きやすい

## ツール構成

- **openapi-typescript**: OpenAPIスキーマからTypeScript型定義を生成
- **swagger-ui-express**: APIドキュメントをブラウザで表示
- **express-openapi-validator**: リクエスト/レスポンスのスキーマバリデーション
- **yaml**: YAMLファイルの読み込み

## ディレクトリ構成

```
sample-functional-ddd/
├── openapi/
│   └── openapi.yaml          # OpenAPIスキーマ定義（契約）
├── src/
│   ├── generated/
│   │   └── api-schema.ts     # 自動生成されたTypeScript型定義
│   └── presentation/
│       └── api/
│           └── dto/
│               └── productDto.ts  # 生成された型を使用
└── docs/
    └── CONTRACT_DRIVEN_DEVELOPMENT.md  # このドキュメント
```

## 開発ワークフロー

### 1. APIスキーマの定義（契約作成）

まず `openapi/openapi.yaml` でAPIの契約を定義します。

```yaml
paths:
  /api/products:
    get:
      summary: 商品一覧を取得
      responses:
        '200':
          description: 商品一覧の取得に成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  products:
                    type: array
                    items:
                      $ref: '#/components/schemas/ProductDto'

components:
  schemas:
    ProductDto:
      type: object
      required:
        - id
        - title
        - price
      properties:
        id:
          type: integer
          minimum: 1
        title:
          type: string
          minLength: 1
        price:
          type: number
          minimum: 0
        description:
          type: string
          nullable: true
```

### 2. TypeScript型定義の生成

スキーマからTypeScript型を自動生成します。

```bash
# 1回だけ生成
bun run openapi:generate

# ファイル変更を監視して自動生成
bun run openapi:watch
```

これにより `src/generated/api-schema.ts` が生成されます。

```typescript
export interface components {
  schemas: {
    ProductDto: {
      id: number;
      title: string;
      price: number;
      description?: string | null;
    };
  };
}
```

### 3. 生成された型の使用

DTOやコントローラーで生成された型を使用します。

```typescript
import type { components } from '@generated/api-schema';

// 生成された型を使用
export type ProductDto = components['schemas']['ProductDto'];

// 変換関数
export const toProductDto = (product: Product): ProductDto => {
  return {
    id: getId(product),
    title: getTitle(product),
    price: getPrice(product),
    description: getDescription(product) || null,
  };
};
```

### 4. バリデーションの動作確認

express-openapi-validatorが自動的にリクエスト/レスポンスを検証します。

- **リクエストバリデーション**: 不正なパラメータやボディを自動拒否
- **レスポンスバリデーション**: スキーマと一致しないレスポンスを検出

バリデーションエラーは以下の形式で返されます：

```json
{
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "request/response validation failed",
    "errors": [...]
  }
}
```

### 5. APIドキュメントの確認

サーバーを起動してSwagger UIでドキュメントを確認します。

```bash
# APIサーバー起動
bun run dev:api

# ブラウザで確認
# http://localhost:4000/api-docs
```

Swagger UIでは以下が可能です：

- APIエンドポイントの一覧表示
- リクエスト/レスポンスの詳細確認
- ブラウザから直接APIを試すことができる

## 実際の開発フロー

### 新しいAPIエンドポイントを追加する場合

#### ステップ1: スキーマ定義（契約作成）

`openapi/openapi.yaml` に新しいエンドポイントを追加

```yaml
paths:
  /api/products/{id}:
    get:
      summary: 商品詳細を取得
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
            minimum: 1
      responses:
        '200':
          description: 商品詳細の取得に成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductDto'
        '404':
          description: 商品が見つからない
```

#### ステップ2: 型定義を生成

```bash
bun run openapi:generate
```

#### ステップ3: TDDでバックエンド実装

1. **Red Phase**: テストを先に書く
   ```typescript
   test('GET /api/products/:id で商品詳細を取得できる', async () => {
     const app = createApp();
     const response = await request(app).get('/api/products/1');
     expect(response.status).toBe(200);
     expect(response.body.id).toBe(1);
   });
   ```

2. **Green Phase**: 実装
   - UseCaseの実装
   - Controllerの実装
   - Routesへの追加

#### ステップ4: フロントエンド実装

生成された型を使ってフロントエンドを実装

```typescript
import type { components } from '@generated/api-schema';

type ProductDto = components['schemas']['ProductDto'];

const fetchProduct = async (id: number): Promise<ProductDto> => {
  const response = await fetch(`http://localhost:4000/api/products/${id}`);
  return response.json();
};
```

## スキーマ変更時の注意点

### 破壊的変更を避ける

- 既存フィールドの型を変更しない
- 必須フィールドを追加しない
- レスポンス構造を大きく変えない

### バージョニング

大きな変更が必要な場合は、APIバージョニングを検討：

```yaml
servers:
  - url: http://localhost:4000/v1
    description: APIバージョン1
  - url: http://localhost:4000/v2
    description: APIバージョン2
```

## トラブルシューティング

### 型定義が更新されない

```bash
# 型定義を再生成
bun run openapi:generate

# TypeScriptの型チェック
bun run typecheck
```

### バリデーションエラーが発生する

1. `openapi/openapi.yaml` のスキーマ定義を確認
2. 実際のレスポンスとスキーマが一致しているか確認
3. Swagger UI (`http://localhost:4000/api-docs`) でスキーマを確認

### Swagger UIが表示されない

1. APIサーバーが起動しているか確認
2. `openapi/openapi.yaml` が正しいYAML形式か確認
3. サーバーログでエラーを確認

## ベストプラクティス

### 1. スキーマファースト

実装前に必ずスキーマを定義し、フロントエンド・バックエンドで合意を取る。

### 2. 詳細な説明を記載

```yaml
components:
  schemas:
    ProductDto:
      type: object
      properties:
        id:
          type: integer
          description: 商品ID（正の整数）
          example: 1
          minimum: 1
```

### 3. 例を含める

```yaml
responses:
  '200':
    content:
      application/json:
        example:
          products:
            - id: 1
              title: "iPhone 15"
              price: 999.99
```

### 4. エラーレスポンスも定義

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          properties:
            type:
              type: string
            message:
              type: string
```

### 5. 生成ファイルはコミットしない

`src/generated/` は `.gitignore` に追加し、ビルド時に生成する。

```gitignore
# 自動生成されたファイル
src/generated/
```

### 6. CI/CDでの型生成

```json
{
  "scripts": {
    "prebuild": "bun run openapi:generate",
    "build": "tsc && vite build"
  }
}
```

## 参考リンク

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator)

## まとめ

契約駆動開発により、以下が実現できます：

1. **型安全**: スキーマから自動生成された型でコンパイル時に検証
2. **自動ドキュメント**: Swagger UIで常に最新のドキュメントを提供
3. **自動バリデーション**: リクエスト/レスポンスが自動検証される
4. **並行開発**: フロントエンドとバックエンドが独立して開発できる
5. **テスト容易**: 契約に基づいた明確なテストが書ける

この開発手法とTDDを組み合わせることで、高品質なAPIを効率的に開発できます。
