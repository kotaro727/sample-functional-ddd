import { Page, APIRequestContext, expect } from '@playwright/test';

/**
 * E2Eテストで使用する共通ヘルパー関数
 */

/**
 * ログイン処理を行うヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * @param email - ログインメールアドレス
 * @param password - ログインパスワード
 * @throws ログインページが未実装の場合はエラーをスロー
 * 
 * @example
 * ```typescript
 * await login(page, 'test@example.com', 'password123');
 * ```
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // ログインページに遷移
  await page.goto('/login');

  // フォームに入力
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);

  // ログインボタンをクリック
  await page.locator('button[type="submit"]').click();

  // ログイン成功を待機（ナビゲーション完了を確認）
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
}

/**
 * ログアウト処理を行うヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * 
 * @example
 * ```typescript
 * await logout(page);
 * ```
 */
export async function logout(page: Page): Promise<void> {
  // ログアウトボタンをクリック
  await page.locator('[data-testid="logout-button"]').click();

  // ログインページに戻ることを確認
  await page.waitForURL(/\/login/, { timeout: 10000 });
}

/**
 * API経由でログイン状態を作成するヘルパー関数
 * UIを経由せずにログイン状態を作成することで、テストを高速化できます
 * 
 * @param page - Playwrightのページオブジェクト
 * @param email - ログインメールアドレス
 * @param password - ログインパスワード
 * @returns 認証トークン
 * 
 * @example
 * ```typescript
 * const token = await loginViaAPI(page, 'test@example.com', 'password123');
 * ```
 */
export async function loginViaAPI(
  page: Page,
  email: string,
  password: string
): Promise<string> {
  const apiBaseURL = 'http://localhost:4000';

  // API経由でログイン
  const response = await page.request.post(`${apiBaseURL}/api/auth/login`, {
    data: {
      email,
      password,
    },
  });

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  const token = data.token;

  // 認証トークンをローカルストレージに保存
  await page.evaluate((authToken) => {
    localStorage.setItem('authToken', authToken);
  }, token);

  return token;
}

/**
 * テストユーザーを作成するヘルパー関数
 * 
 * @param request - PlaywrightのAPIリクエストコンテキスト
 * @param userData - ユーザーデータ
 * @returns 作成されたユーザー情報
 * 
 * @example
 * ```typescript
 * const user = await createTestUser(request, {
 *   email: 'test@example.com',
 *   password: 'password123',
 *   name: 'Test User'
 * });
 * ```
 */
export async function createTestUser(
  request: APIRequestContext,
  userData: {
    email: string;
    password: string;
    name: string;
  }
): Promise<{ id: string; email: string; name: string }> {
  const apiBaseURL = 'http://localhost:4000';

  const response = await request.post(`${apiBaseURL}/api/users`, {
    data: userData,
  });

  expect(response.ok()).toBeTruthy();

  const user = await response.json();
  return user;
}

/**
 * テストデータをクリーンアップするヘルパー関数
 * 
 * @param request - PlaywrightのAPIリクエストコンテキスト
 * @param resourceType - リソースタイプ (users, products, ordersなど)
 * @param resourceId - リソースID
 * 
 * @example
 * ```typescript
 * await cleanupTestData(request, 'users', userId);
 * ```
 */
export async function cleanupTestData(
  request: APIRequestContext,
  resourceType: string,
  resourceId: string
): Promise<void> {
  const apiBaseURL = 'http://localhost:4000';

  const response = await request.delete(
    `${apiBaseURL}/api/${resourceType}/${resourceId}`
  );

  // 404（存在しない）または200（削除成功）を許容
  expect([200, 204, 404]).toContain(response.status());
}

/**
 * ページが完全にロードされるまで待機するヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * 
 * @example
 * ```typescript
 * await waitForPageLoad(page);
 * ```
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 特定の要素が表示されるまで待機するヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * @param selector - セレクタ
 * @param timeout - タイムアウト時間（ミリ秒）
 * 
 * @example
 * ```typescript
 * await waitForElement(page, '[data-testid="product-list"]');
 * ```
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}

/**
 * フォームに値を入力するヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * @param formData - フォームデータ（キーがname属性、値が入力値）
 * 
 * @example
 * ```typescript
 * await fillForm(page, {
 *   email: 'test@example.com',
 *   password: 'password123',
 *   name: 'Test User'
 * });
 * ```
 */
export async function fillForm(
  page: Page,
  formData: Record<string, string>
): Promise<void> {
  for (const [name, value] of Object.entries(formData)) {
    await page.locator(`input[name="${name}"], textarea[name="${name}"]`).fill(value);
  }
}

/**
 * スクリーンショットを撮影するヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * @param name - スクリーンショットの名前
 * 
 * @example
 * ```typescript
 * await takeScreenshot(page, 'login-page');
 * ```
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * モックAPIレスポンスを設定するヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * @param url - APIエンドポイントのURL（パターンマッチング可能）
 * @param responseData - モックレスポンスデータ
 * @param status - HTTPステータスコード（デフォルト: 200）
 * 
 * @example
 * ```typescript
 * await mockAPIResponse(page, '**/api/products', [
 *   { id: '1', name: 'Product 1', price: 100 }
 * ]);
 * ```
 */
export async function mockAPIResponse(
  page: Page,
  url: string,
  responseData: unknown,
  status = 200
): Promise<void> {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * ローカルストレージの値を取得するヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * @param key - ローカルストレージのキー
 * @returns ローカルストレージの値
 * 
 * @example
 * ```typescript
 * const token = await getLocalStorageItem(page, 'authToken');
 * ```
 */
export async function getLocalStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return await page.evaluate((storageKey) => {
    return localStorage.getItem(storageKey);
  }, key);
}

/**
 * ローカルストレージに値を設定するヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * @param key - ローカルストレージのキー
 * @param value - 設定する値
 * 
 * @example
 * ```typescript
 * await setLocalStorageItem(page, 'authToken', 'token123');
 * ```
 */
export async function setLocalStorageItem(
  page: Page,
  key: string,
  value: string
): Promise<void> {
  await page.evaluate(
    ({ storageKey, storageValue }) => {
      localStorage.setItem(storageKey, storageValue);
    },
    { storageKey: key, storageValue: value }
  );
}

/**
 * ローカルストレージをクリアするヘルパー関数
 * 
 * @param page - Playwrightのページオブジェクト
 * 
 * @example
 * ```typescript
 * await clearLocalStorage(page);
 * ```
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * テストユーザーの認証情報
 */
export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!',
    name: 'Admin User',
  },
  user: {
    email: 'user@example.com',
    password: 'User123!',
    name: 'Test User',
  },
  guest: {
    email: 'guest@example.com',
    password: 'Guest123!',
    name: 'Guest User',
  },
} as const;

/**
 * API Base URL
 */
export const API_BASE_URL = 'http://localhost:4000';

/**
 * Frontend Base URL
 */
export const FRONTEND_BASE_URL = 'http://localhost:3000';

