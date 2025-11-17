<!-- 9ca0756b-63b5-469e-b330-75b0e435b8bf f62336eb-6402-4246-ad3c-5889222610d9 -->
# Playwright E2Eテスト導入計画

## 概要

Playwrightを導入し、フロントエンドとAPIを含むE2Eテストの基盤を構築します。テストコードは`playwright/`ディレクトリに配置し、既存の`bun test`とは別コマンドで実行できるようにします。

## 実装内容

### 1. 依存関係の追加

- `package.json`にPlaywright関連パッケージを追加
  - `@playwright/test` (devDependencies)
  - ブラウザドライバーは自動インストール

### 2. Playwright設定ファイルの作成

- `playwright.config.ts`を作成
  - TypeScript設定
  - テストディレクトリ: `playwright/`
  - baseURL: `http://localhost:3000` (フロントエンド)
  - API baseURL: `http://localhost:4000` (バックエンド)
  - 複数ブラウザ対応（Chromium, Firefox, WebKit）
  - スクリーンショット・動画の設定

### 3. テストディレクトリ構造の作成

- `playwright/`ディレクトリを作成
- `playwright/tests/` - テストファイル
- `playwright/fixtures/` - テストフィクスチャ（必要に応じて）
- `playwright/utils/` - テストユーティリティ（必要に応じて）

### 4. サンプルE2Eテストの作成

- `playwright/tests/login.spec.ts` - ログイン機能のE2Eテスト例
  - ログインページへの遷移
  - ログインフォームの入力
  - ログイン成功の検証
  - エラーハンドリングのテスト
  - 注: ログイン機能が未実装の場合はスケルトンとして作成

### 5. package.jsonスクリプトの追加

- `test:e2e` - Playwrightテストの実行
- `test:e2e:ui` - Playwright UIモードでの実行
- `test:e2e:debug` - デバッグモードでの実行
- `test:e2e:report` - テストレポートの表示

### 6. .gitignoreの更新

- Playwright関連の生成ファイルを追加
  - `test-results/`
  - `playwright-report/`
  - `playwright/.auth/` (認証状態の保存ファイル)

### 7. テストユーティリティの作成（オプション）

- `playwright/utils/test-helpers.ts` - 共通ヘルパー関数
  - ログイン処理のヘルパー
  - API呼び出しのヘルパー
  - データセットアップのヘルパー

## ファイル構成

```
playwright/
├── config.ts (必要に応じて)
├── tests/
│   └── login.spec.ts
├── fixtures/ (必要に応じて)
└── utils/ (必要に応じて)
  └── test-helpers.ts
```

## 注意事項

- ログイン機能が未実装の場合、テストはスケルトンとして作成し、実装後に有効化
- テスト実行前にフロントエンド（port 3000）とバックエンド（port 4000）が起動している必要がある
- CI/CDでの実行を考慮した設定も含める

## ドキュメント

- `docs/Playwrightについて.md` - Playwrightの使用方法、テストの書き方、実行方法などを記載

### To-dos

- [ ] Playwrightパッケージをpackage.jsonに追加
- [ ] playwright.config.tsを作成（TypeScript設定、baseURL、テストディレクトリ設定）
- [ ] playwright/ディレクトリ構造を作成（tests/, utils/など）
- [ ] playwright/tests/login.spec.tsにログインE2Eテストのサンプルを作成
- [ ] package.jsonにtest:e2e関連のスクリプトを追加
- [ ] .gitignoreにPlaywright関連の生成ファイルを追加
- [ ] playwright/utils/test-helpers.tsに共通ヘルパー関数を作成（ログイン処理など）