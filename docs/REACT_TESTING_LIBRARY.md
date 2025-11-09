# React Testing Library ガイド

このドキュメントでは、React Testing Libraryを使用したコンポーネントのテスト方法について説明します。

## インストール

以下のパッケージをインストールします:

```bash
bun add -d @testing-library/react @testing-library/user-event happy-dom
```

- **@testing-library/react**: Reactコンポーネントのテストユーティリティ
- **@testing-library/user-event**: ユーザーインタラクションのシミュレーション
- **happy-dom**: 軽量なDOM実装（Bunのテスト環境で使用）

## 実行方法

テストを実行するには以下のコマンドを使用します:

```bash
# 全テストを実行
bun test

# 特定のファイルのみ実行
bun test src/presentation/ui/pages/ProductListPage.test.tsx

# watch モードで実行
bun test --watch
```

## 基本的な考え方

React Testing Libraryは「ユーザーがアプリケーションを使う方法に近い形でテストを書く」という哲学に基づいています。

**推奨:**
- ユーザーに見える内容（テキスト、ラベル、役割）でクエリする
- 実際のユーザー操作をシミュレートする
- アクセシビリティを意識したテストを書く

**非推奨:**
- 実装の詳細（state、props、内部メソッド）に依存したテスト
- classNameやidに依存したクエリ（最後の手段として使用）

## 主要なAPI

### 1. render()
コンポーネントをテスト用の仮想DOMにレンダリングします。

```typescript
import { render } from '@testing-library/react';
import { MyComponent } from './MyComponent';

const { container, getByText } = render(<MyComponent />);
```

### 2. screen
レンダリングされた要素にアクセスするためのユーティリティ。

```typescript
import { render, screen } from '@testing-library/react';

render(<MyComponent />);
const element = screen.getByText('Hello');
```

### 3. waitFor()
非同期処理の完了を待つためのユーティリティ。

```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeDefined();
});
```

### 4. userEvent
ユーザーインタラクションをシミュレート。

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(screen.getByRole('button'));
await user.type(screen.getByRole('textbox'), 'Hello');
```

## クエリの優先順位

以下の順序で使用することが推奨されます:

1. **getByRole**: アクセシビリティを意識（最優先）
   ```typescript
   screen.getByRole('button', { name: '送信' })
   screen.getByRole('heading', { level: 1 })
   ```

2. **getByLabelText**: フォーム要素用
   ```typescript
   screen.getByLabelText('メールアドレス')
   ```

3. **getByPlaceholderText**: プレースホルダーテキスト
   ```typescript
   screen.getByPlaceholderText('名前を入力')
   ```

4. **getByText**: 表示テキスト
   ```typescript
   screen.getByText('商品一覧')
   screen.getByText(/読み込み中/)  // 正規表現も使用可能
   ```

5. **getByTestId**: 最後の手段
   ```typescript
   screen.getByTestId('product-list')
   ```

## クエリのバリエーション

- **getBy**: 要素が見つからない場合はエラー（存在確認に使用）
- **queryBy**: 要素が見つからない場合はnullを返す（非存在確認に使用）
- **findBy**: 非同期で要素を探す（Promiseを返す）

```typescript
// 要素が存在することを確認
expect(screen.getByText('Hello')).toBeDefined();

// 要素が存在しないことを確認
expect(screen.queryByText('Goodbye')).toBeNull();

// 非同期で要素が表示されるのを待つ
const element = await screen.findByText('Loaded');
```

## fetchのモック

APIリクエストをモックするには、`globalThis.fetch`を上書きします:

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';

beforeEach(() => {
  // @ts-ignore
  globalThis.fetch = undefined;
});

test('APIからデータを取得して表示する', async () => {
  // fetchをモック
  globalThis.fetch = async (url: string | URL | Request) => {
    if (url.toString().includes('/api/products')) {
      return new Response(
        JSON.stringify({
          products: [
            { id: 1, title: 'テスト商品', price: 100 }
          ]
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    return new Response('Not Found', { status: 404 });
  };

  render(<ProductListPage />);

  // ローディング状態を確認
  expect(screen.getByText(/読み込み中/)).toBeDefined();

  // データが表示されるのを待つ
  await waitFor(() => {
    expect(screen.getByText('テスト商品')).toBeDefined();
  });
});
```

## テストの構造

### 基本的なテンプレート

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import { MyComponent } from './MyComponent';

// happy-domをセットアップ
beforeEach(() => {
  // @ts-ignore
  globalThis.fetch = undefined;
});

describe('MyComponent', () => {
  test('正常に表示される', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeDefined();
  });

  test('ボタンをクリックすると状態が変わる', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Clicked')).toBeDefined();
  });

  test('非同期データを取得して表示する', async () => {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ message: 'Success' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    render(<MyComponent />);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeDefined();
    });
  });

  test('エラー時はエラーメッセージを表示する', async () => {
    globalThis.fetch = async () => {
      return new Response('Error', { status: 500 });
    };

    render(<MyComponent />);

    await waitFor(() => {
      expect(screen.getByText(/エラー/)).toBeDefined();
    });
  });
});
```

## よくあるパターン

### 1. ローディング状態のテスト

```typescript
test('ローディング中は読み込み中メッセージを表示する', () => {
  render(<MyComponent />);
  expect(screen.getByText(/読み込み中/)).toBeDefined();
});
```

### 2. 空状態のテスト

```typescript
test('データが0件の場合はメッセージを表示する', async () => {
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ products: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  render(<ProductListPage />);

  await waitFor(() => {
    expect(screen.getByText(/商品がありません/)).toBeDefined();
  });
});
```

### 3. エラー状態のテスト

```typescript
test('エラー時にエラーメッセージを表示する', async () => {
  globalThis.fetch = async () => {
    return new Response('Internal Server Error', { status: 500 });
  };

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText(/エラー/)).toBeDefined();
  });
});
```

### 4. フォーム入力のテスト

```typescript
test('フォームに入力して送信できる', async () => {
  const user = userEvent.setup();
  render(<MyForm />);

  await user.type(screen.getByLabelText('名前'), '山田太郎');
  await user.click(screen.getByRole('button', { name: '送信' }));

  await waitFor(() => {
    expect(screen.getByText(/送信完了/)).toBeDefined();
  });
});
```

## ベストプラクティス

1. **実装の詳細ではなく、ユーザーの視点でテストする**
   - 悪い例: `expect(component.state.isLoading).toBe(true)`
   - 良い例: `expect(screen.getByText(/読み込み中/)).toBeDefined()`

2. **アクセシビリティを意識する**
   - 可能な限り `getByRole` や `getByLabelText` を使用
   - `getByTestId` は最後の手段

3. **非同期処理は必ず `waitFor` を使う**
   - データ取得後の表示
   - ユーザー操作後の状態変化

4. **各テストは独立させる**
   - `beforeEach` でクリーンアップ
   - グローバル変数への依存を避ける

5. **テストは日本語で書く（ドキュメントの役割）**
   - テストケース名は具体的に
   - 期待される動作を明確に記述

## 参考リンク

- [React Testing Library 公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library クエリ優先順位](https://testing-library.com/docs/queries/about/#priority)
- [Bun テストランナー](https://bun.sh/docs/cli/test)
