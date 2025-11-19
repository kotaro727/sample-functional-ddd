import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2Eテスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './playwright/tests',
  
  // 並列実行を完全に無効化（テストファイル間・ファイル内共に）
  fullyParallel: false,
  
  // CI環境でのみfailFastを有効化
  forbidOnly: !!process.env.CI,
  
  // CIでは3回までリトライ、ローカルではリトライなし
  retries: process.env.CI ? 3 : 0,
  
  // 並列ワーカー数: CIでは1、ローカルではマシンのCPUコア数に応じて
  workers: process.env.CI ? 1 : undefined,
  
  // テストレポーター設定
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  // テスト共通設定
  use: {
    // ベースURL（フロントエンド）
    baseURL: 'http://localhost:3000',
    
    // 失敗時のスクリーンショットを取得
    screenshot: 'only-on-failure',
    
    // 失敗時のトレースを記録
    trace: 'retain-on-failure',
    
    // 失敗時の動画を記録
    video: 'retain-on-failure',
    
    // アクションのタイムアウト
    actionTimeout: 10000,
    
    // ナビゲーションのタイムアウト
    navigationTimeout: 30000,
  },
  
  // テストのタイムアウト
  timeout: 60000,
  
  // プロジェクト（ブラウザ）設定
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // API用のbaseURL
        extraHTTPHeaders: {
          'X-API-Base-URL': 'http://localhost:4000',
        },
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        extraHTTPHeaders: {
          'X-API-Base-URL': 'http://localhost:4000',
        },
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        extraHTTPHeaders: {
          'X-API-Base-URL': 'http://localhost:4000',
        },
      },
    },

    /* モバイルブラウザのテスト（必要に応じてコメント解除）
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        extraHTTPHeaders: {
          'X-API-Base-URL': 'http://localhost:4000',
        },
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        extraHTTPHeaders: {
          'X-API-Base-URL': 'http://localhost:4000',
        },
      },
    },
    */
  ],

  /* Webサーバー設定（必要に応じてコメント解除）
   * テスト実行前に自動的にサーバーを起動する
   */
  // webServer: [
  //   {
  //     command: 'bun run dev',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //   },
  //   {
  //     command: 'bun run dev:api',
  //     url: 'http://localhost:4000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //   },
  // ],
});

