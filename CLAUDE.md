# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

**このプロジェクトでは日本語を使用してください。**
- コメント、ドキュメント、コミットメッセージは日本語で記述
- コードの説明やディスカッションも日本語で行う
- 変数名や関数名は英語を使用（TypeScriptの慣例に従う）

## プロジェクト概要

関数型プログラミング（FP）とドメイン駆動設計（DDD）を組み合わせた受発注システムのサンプルプロジェクトです。TypeScriptで実装し、ヘキサゴナルアーキテクチャ（ポート&アダプター）を採用しています。

## アーキテクチャ

### 層構造と依存関係

```
Presentation → Application → Domain
       ↓            ↓
Infrastructure (Portsを実装)
```

**依存関係のルール:**
- 外側の層は内側の層にのみ依存
- 内側の層は外側の層に依存しない（依存性逆転の原則）
- InfrastructureはApplicationのPorts（インターフェース）を実装

### 各層の責務

**Domain (`src/domain/`)**: 外部依存を持たない純粋なビジネスロジック
- 境界づけられたコンテキスト（注文、顧客、商品）ごとに集約を編成
- 純粋関数とイミュータブルなデータ構造
- 値オブジェクトは`shared/valueObjects/`に配置
- ドメインイベントは各集約ディレクトリ内
- エラーハンドリング用のResult型は`shared/result.ts`

**Application (`src/application/`)**: ユースケースとビジネスフロー
- ユースケースを関数として実装（例: `createOrder.ts`, `cancelOrder.ts`）
- Ports（インターフェース）は`ports/`サブディレクトリに定義
- 関数合成によってワークフローを構築
- 依存性はPortsを通じて抽象化

**Infrastructure (`src/infrastructure/`)**: 外部システムアダプター
- `persistence/`: データベース実装（Prisma予定）
- `persistence/repositories/`: リポジトリの具体的実装
- `external/`: サードパーティサービス連携
- `config/`: 技術的な設定

**Presentation (`src/presentation/`)**: ユーザーインターフェースとAPI
- `api/routes/`: APIルーティング定義
- `api/controllers/`: リクエストハンドラー
- `api/middleware/`: 横断的関心事
- `api/dto/`: API境界のためのデータ転送オブジェクト
- `ui/`: Reactによるフロントエンド
  - `ui/components/`: 再利用可能なReactコンポーネント
  - `ui/pages/`: ページコンポーネント
  - `ui/hooks/`: カスタムフック

**Shared (`src/shared/`)**: 横断的な関数型ユーティリティ
- `functional/either.ts`: エラーハンドリング用Either型
- `functional/option.ts`: null許容値用Option型
- `functional/task.ts`: 非同期処理用Task型
- `functional/pipe.ts`: 関数合成ユーティリティ
- `logger/`: ロギングユーティリティ

## 関数型プログラミングの原則

**イミュータビリティ**: すべてのデータ構造は不変である必要があります。readonly型を使用し、ミューテーションを避けます。

**純粋関数**: DomainとApplication層の関数は純粋であるべきです（副作用なし、決定論的）。

**関数合成**: `shared/functional/`のユーティリティを使用して、小さく焦点を絞った関数を合成することで複雑な操作を構築します。

**型安全性**: TypeScriptの型システムを最大限活用します。ドメインモデルには判別可能な共用体型（ADT）を使用します。

## テスト駆動開発（TDD）

**このプロジェクトではTDD（Test-Driven Development）を採用します。**

### TDDサイクル
1. **Red**: まず失敗するテストを書く
2. **Green**: テストが通る最小限の実装を行う
3. **Refactor**: コードをリファクタリングして改善

### 開発フロー（厳守）

**必ずこの順序で開発を進めること:**

1. **失敗するテストを書く（Red）**
   - テストファイルを作成
   - テストを実行して失敗を確認
   - **開発者に確認してもらう**

2. **開発者からコミット指示を受ける**

3. **テストをグリーンにする実装を書く（Green）**
   - 最小限の実装を追加
   - テストを実行して成功を確認
   - **開発者に確認してもらう**

4. **開発者からコミット指示を受ける**

5. **次の機能に進む、または必要に応じてリファクタリング（Refactor）**

この順序を守ることで、開発者が各ステップを確認でき、適切なタイミングでコミットできます。

### テストの原則
- **テストは日本語で記述**: テストはドキュメントとしての役割も果たすため、describeとtestの説明は日本語で記述
- **モックは極力使用しない**: 純粋関数のテストでは実際の値を使用。外部APIなど副作用がある場合のみモックを使用
- **各層でテストを書く**:
  - Domain層: 値オブジェクト、集約、ドメインサービスの純粋関数をテスト
  - Application層: ユースケースのロジックをテスト（Portsは実装を注入）
  - Infrastructure層: 外部システムとの統合テスト
  - Presentation層: コントローラーのHTTPハンドリングをテスト

### テストファイルの配置
- テストファイルは実装ファイルと同じディレクトリに配置
- ファイル名: `{name}.test.ts` または `{name}.test.tsx`（Reactコンポーネント）

### React Testing Library の使い方

**基本的な考え方:**
ユーザーがアプリケーションを使う方法に近い形でテストを書く

**主要なAPI:**

1. **render()** - コンポーネントをレンダリング
```tsx
import { render } from '@testing-library/react';
render(<MyComponent />);
```

2. **screen** - レンダリングされた要素にアクセス
```tsx
import { screen } from '@testing-library/react';

// テキストで要素を取得
screen.getByText('ボタン');           // 見つからない場合はエラー
screen.queryByText('ボタン');         // 見つからない場合はnull
screen.findByText('ボタン');          // 非同期、見つかるまで待つ

// 正規表現も使用可能
screen.getByText(/読み込み中/);

// ロール（role）で取得（推奨）
screen.getByRole('button', { name: '送信' });
```

3. **waitFor()** - 非同期処理を待つ
```tsx
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('完了')).toBeDefined();
});
```

4. **fetch のモック**
```tsx
globalThis.fetch = async (url) => {
  return new Response(
    JSON.stringify({ data: 'test' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
```

**クエリの優先順位（推奨順）:**
1. `getByRole` - アクセシビリティを意識したクエリ
2. `getByLabelText` - フォーム要素用
3. `getByText` - 表示されるテキストコンテンツ
4. `getByTestId` - 最後の手段（data-testid属性を使用）

**バリアント:**
- `getBy*` - 要素が見つからない場合はエラー
- `queryBy*` - 要素が見つからない場合はnull
- `findBy*` - 非同期、要素が見つかるまで待つ

**テストの例:**
```tsx
import { describe, test, expect } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';

describe('MyComponent', () => {
  test('ボタンをクリックするとテキストが変わる', async () => {
    render(<MyComponent />);

    // 初期状態を確認
    expect(screen.getByText('Hello')).toBeDefined();

    // 非同期でデータが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeDefined();
    });
  });
});
```

## React Routerの利用方針

- **バージョン**: `react-router`/`react-router-dom`はv7系列（現在`^7.9.5`）を採用。Data Router API（`createBrowserRouter`/`RouterProvider`）を前提とし、React 18の同期待機サポートを活用する。
- **役割**: Presentation層(UI)におけるページ遷移とデータ取得のオーケストレーション。Domain/Application層のロジックはサーバー側に留め、クライアントはDTOを受け取って表示に専念する。

### ルーティング構成
1. `src/presentation/ui/router.tsx`（未作成なら新規）で`createBrowserRouter`を用いたルート定義を集約する。
2. ルートごとに`element`/`loader`/`action`/`errorElement`を並べ、`App.tsx`では`RouterProvider router={router}`のみを描画する。
3. ページコンポーネントは`src/presentation/ui/pages`配下に置き、レイアウト共通処理は`components/layouts`などに分離する。

```tsx
// 例: src/presentation/ui/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './components/layouts/RootLayout';
import { ProductListPage } from './pages/ProductListPage';
import { productListLoader } from './routes/productLoaders';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        index: true,
        loader: productListLoader,
        element: <ProductListPage />,
      },
    ],
  },
]);
```

### Data API（Loader/Action/Fetcher）
- **Loader**: API呼び出しとDTO整形を集約し、コンポーネント本体は`useLoaderData`で結果を受ける。`defer`を使う場合もトップレベルで結果型を定義し再利用する。
- **Action**: フォーム送信など書き込み系副作用を集約し、HTTPレスポンスの`type`/`message`をUIで解釈する。成功時は`redirect()`で遷移させる。
- **型付け**: `type ProductListLoaderData = Awaited<ReturnType<typeof productListLoader>>;`のようにローダー返却型を再利用し、`useLoaderData<ProductListLoaderData>()`で型安全に扱う。

### エラーハンドリングと遷移
- 各ルートに`errorElement`を設定し、`useRouteError()`でOpenAPIバリデーションエラーやネットワークエラーを表示分岐する。
- 404/ドメインエラーはサーバーが返す`{ error: { type, message } }`をそのままUIへ表示するか、i18nマッピングを通す。
- リダイレクトはLoader/Actionから`redirect('/path')`を返し、副作用の一元化を維持する。

### テスト
- ルーター付きテストは`createMemoryRouter`で本番と同じルート定義を読み込み、`RouterProvider`を`render`する。
- Loader/Actionは純粋関数なので`happy-dom`の`fetch`スタブや`msw`を使いながらユニットテスト可能。
- ページ単体テストでは必要な子ルートだけを含むメモリルーターを生成し、遷移・エラー表示を検証する。

## 開発コマンド

### セットアップ
```bash
bun install
```

### 開発サーバー起動

**APIサーバー（バックエンド）**
```bash
bun run dev:api  # ポート4000で起動
```

**フロントエンド（React）**
```bash
bun run dev  # ポート3000で起動
```

**並行起動**: APIとフロントエンドを同時に開発する場合は、2つのターミナルで別々に起動

### テスト実行
```bash
bun test
```

### ビルド
```bash
bun run build
```

### 型チェック
```bash
bun run typecheck
```

### OpenAPI型生成
```bash
# OpenAPIスキーマからTypeScript型を生成
bun run openapi:generate

# スキーマファイルの変更を監視して自動生成
bun run openapi:watch
```

## 契約駆動開発（OpenAPI）

このプロジェクトでは、OpenAPIを使用した契約駆動開発を採用しています。

### 基本的な流れ

1. **契約を定義**: `openapi/openapi.yaml` でAPIの仕様を定義
2. **型を生成**: `bun run openapi:generate` でTypeScript型を自動生成
3. **TDDで実装**: 生成された型を使ってテスト駆動で実装
4. **ドキュメント確認**: Swagger UI (`http://localhost:4000/api-docs`) で確認

### OpenAPIスキーマの定義

新しいAPIエンドポイントを追加する場合:

1. `openapi/openapi.yaml` にエンドポイントを追加
2. リクエスト/レスポンスのスキーマを定義
3. 型定義を再生成: `bun run openapi:generate`
4. `src/generated/api-schema.ts` に型が生成される

### 生成された型の使用

```typescript
import type { components } from '@generated/api-schema';

// スキーマから型を取得
export type ProductDto = components['schemas']['ProductDto'];

// レスポンス型の取得
export type GetProductsResponse = operations['getProducts']['responses']['200']['content']['application/json'];
```

### バリデーション

`@hono/zod-openapi` が自動的に以下を検証:
- リクエストパラメータ (`c.req.valid('param')`)
- リクエストボディ (`c.req.valid('json' | 'form')`)
- レスポンス（Zodスキーマと`c.json(..., status)`の組み合わせ）

スキーマと一致しないリクエスト/レスポンスはデフォルトHookにより`VALIDATION_ERROR`レスポンスが返ります。

### APIドキュメント

APIサーバー起動後、以下にアクセス:
- Swagger UI: `http://localhost:4000/api-docs`
- 商品一覧API: `http://localhost:4000/api/products`

詳細は [契約駆動開発ガイド](docs/CONTRACT_DRIVEN_DEVELOPMENT.md) を参照。

## 実装ガイドライン

### 新しい集約の作成
1. `src/domain/{aggregate-name}/`配下にディレクトリを作成
2. `{aggregate}.ts`で判別可能な共用体型を使用して型を定義
3. `{aggregate}Validation.ts`にバリデーションロジックを追加
4. `{aggregate}Service.ts`にドメインサービスを実装
5. `events.ts`にドメインイベントを定義

### ユースケースの作成
1. `src/application/{aggregate}/`にファイルを作成
2. 必要なPortsをインターフェースとして`src/application/ports/`に定義
3. 依存性と入力を受け取る関数としてユースケースを実装
4. ワークフローには`shared/functional/`の関数合成を使用
5. エラーハンドリングにはResultまたはEither型を返す

### Infrastructureアダプターの実装
1. 適切な`src/infrastructure/`サブディレクトリにアダプターを作成
2. Application層のPortインターフェースを実装
3. 技術的な詳細（DBアクセス、API呼び出しなど）を処理
4. ドメインモデルと外部表現の間で変換を行う

### エラーハンドリング
- 例外をスローする代わりに`shared/functional/`のResult/Either型を使用
- ドメインバリデーションはResult型を返す
- Application層は関数合成を使用してエラーを伝播
- Infrastructure層は例外をキャッチしてResult/Eitherに変換

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Bun
- **Webフレームワーク**: Hono (+ @hono/node-server)
- **ORM**: Prisma（予定）
- **テスト**: Bun test
- **UI**: React
