import { test, expect } from '@playwright/test';

/**
 * ログイン機能のE2Eテスト
 * 
 * 注意: このテストは、ログイン機能が実装されるまでスキップされます。
 * ログイン機能が実装されたら、test.skip を test に変更してください。
 */

test.describe('ログイン機能', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にログインページに遷移
    // TODO: ログインページが実装されたら、適切なパスに変更してください
    // await page.goto('/login');
  });

  test.skip('ログインページが正しく表示される', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/ログイン/);
    
    // ログインフォームの要素が存在することを確認
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test.skip('正しい認証情報でログインできる', async ({ page }) => {
    // テスト用のユーザー情報
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
    };

    // ログインページに遷移
    await page.goto('/login');

    // フォームに入力
    await page.locator('input[name="email"]').fill(testUser.email);
    await page.locator('input[name="password"]').fill(testUser.password);

    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click();

    // ログイン後、ダッシュボードまたはホームページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/(dashboard|home)?/);

    // ログイン成功の確認（例: ユーザー名が表示される）
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test.skip('誤った認証情報でログインできない', async ({ page }) => {
    // 無効なユーザー情報
    const invalidUser = {
      email: 'invalid@example.com',
      password: 'WrongPassword123!',
    };

    // ログインページに遷移
    await page.goto('/login');

    // フォームに入力
    await page.locator('input[name="email"]').fill(invalidUser.email);
    await page.locator('input[name="password"]').fill(invalidUser.password);

    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click();

    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /認証に失敗|ログインできません|メールアドレスまたはパスワードが正しくありません/
    );

    // ログインページに留まることを確認
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip('空のフォームで送信するとバリデーションエラーが表示される', async ({ page }) => {
    // ログインページに遷移
    await page.goto('/login');

    // 何も入力せずに送信
    await page.locator('button[type="submit"]').click();

    // バリデーションエラーが表示されることを確認
    await expect(
      page.locator('[data-testid="email-error"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="password-error"]')
    ).toBeVisible();
  });

  test.skip('メールアドレスの形式が正しくない場合、バリデーションエラーが表示される', async ({ page }) => {
    // ログインページに遷移
    await page.goto('/login');

    // 無効なメールアドレスを入力
    await page.locator('input[name="email"]').fill('invalid-email');
    await page.locator('input[name="password"]').fill('Test123!');

    // 送信
    await page.locator('button[type="submit"]').click();

    // メールアドレスのバリデーションエラーが表示されることを確認
    await expect(
      page.locator('[data-testid="email-error"]')
    ).toContainText(/正しいメールアドレス|メールアドレスの形式/);
  });

  test.skip('ログアウト機能が正しく動作する', async ({ page }) => {
    // まずログインする
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('Test123!');
    await page.locator('button[type="submit"]').click();

    // ログイン成功を確認
    await expect(page).toHaveURL(/\/(dashboard|home)?/);

    // ログアウトボタンをクリック
    await page.locator('[data-testid="logout-button"]').click();

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login/);

    // 認証が必要なページにアクセスしようとするとログインページにリダイレクトされることを確認
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip('パスワードの表示/非表示トグルが動作する', async ({ page }) => {
    // ログインページに遷移
    await page.goto('/login');

    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('[data-testid="toggle-password-visibility"]');

    // 初期状態ではパスワードが隠れている
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // トグルボタンをクリック
    await toggleButton.click();

    // パスワードが表示される
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // もう一度トグルボタンをクリック
    await toggleButton.click();

    // パスワードが再び隠れる
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test.skip('「パスワードを忘れた」リンクが動作する', async ({ page }) => {
    // ログインページに遷移
    await page.goto('/login');

    // 「パスワードを忘れた」リンクをクリック
    await page.locator('[data-testid="forgot-password-link"]').click();

    // パスワードリセットページに遷移することを確認
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

/**
 * 認証状態の永続化テスト
 */
test.describe('認証状態の永続化', () => {
  test.skip('ログイン後、ページをリロードしても認証状態が保持される', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('Test123!');
    await page.locator('button[type="submit"]').click();

    // ログイン成功を確認
    await expect(page).toHaveURL(/\/(dashboard|home)?/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // ページをリロード
    await page.reload();

    // 認証状態が保持されていることを確認
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test.skip('ログイン後、新しいタブを開いても認証状態が共有される', async ({ context, page }) => {
    // ログイン
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('Test123!');
    await page.locator('button[type="submit"]').click();

    // ログイン成功を確認
    await expect(page).toHaveURL(/\/(dashboard|home)?/);

    // 新しいタブを開く
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    // 新しいタブでも認証状態が共有されていることを確認
    await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(newPage).not.toHaveURL(/\/login/);

    await newPage.close();
  });
});

