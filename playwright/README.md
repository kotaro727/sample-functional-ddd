# Playwright E2Eテスト

このディレクトリには、Playwrightを使用したE2E（End-to-End）テストが含まれています。

## ディレクトリ構成

```
playwright/
├── tests/        # E2Eテストファイル
├── utils/        # テストユーティリティ・ヘルパー関数
└── fixtures/     # テストフィクスチャ（必要に応じて）
```

## テストの実行

### すべてのテストを実行
```bash
bun run test:e2e
```

### UIモードでテストを実行（デバッグに便利）
```bash
bun run test:e2e:ui
```

### デバッグモードでテストを実行
```bash
bun run test:e2e:debug
```

### テストレポートを表示
```bash
bun run test:e2e:report
```

### 特定のブラウザでテストを実行
```bash
# Chromiumのみ
bunx playwright test --project=chromium

# Firefoxのみ
bunx playwright test --project=firefox

# WebKitのみ
bunx playwright test --project=webkit
```

## テスト実行前の準備

E2Eテストを実行する前に、以下のサーバーを起動しておく必要があります：

1. フロントエンドサーバー（port 3000）
```bash
bun run dev
```

2. バックエンドAPIサーバー（port 4000）
```bash
bun run dev:api
```

## テストの書き方

### 基本的なテストの例

```typescript
import { test, expect } from '@playwright/test';

test('ページタイトルを確認', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Sample App/);
});
```

### ヘルパー関数の使用

共通のヘルパー関数は `utils/test-helpers.ts` に定義されています。

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../utils/test-helpers';

test('ログイン後にダッシュボードが表示される', async ({ page }) => {
  await login(page, 'user@example.com', 'password');
  await expect(page.locator('h1')).toContainText('ダッシュボード');
});
```

## CI/CDでの実行

CI環境では以下の設定が自動的に適用されます：
- リトライ回数: 3回
- 並列ワーカー数: 1
- forbidOnly: 有効

## トラブルシューティング

### ブラウザのインストール

初回実行時にブラウザのインストールが必要な場合：
```bash
bunx playwright install
```

### 特定のブラウザのみインストール
```bash
bunx playwright install chromium
bunx playwright install firefox
bunx playwright install webkit
```

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [ベストプラクティス](https://playwright.dev/docs/best-practices)

