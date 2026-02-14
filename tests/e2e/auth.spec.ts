import { test, expect } from '@playwright/test';

/**
 * 認証・初期表示の E2E テスト
 * バックエンドとフロントエンドが正しく結合されているかを検証する
 */
test.describe('認証・初期表示', () => {
    test('一般ユーザーが正常にログインでき、打刻画面が表示される', async ({
        page,
    }) => {
        // 1. ログイン画面へアクセス
        await page.goto('/login');

        // 2. フォームに入力 (UserSeeder で作成される標準的なテストユーザー)
        await page.fill('input[name="email"]', 'test1@example.com');
        await page.fill('input[name="password"]', 'usertest');

        // 3. ログインボタンをクリック
        await page.click('button[type="submit"]');

        // 4. 打刻画面への遷移を確認
        await expect(page).toHaveURL(/\/attendance/, { timeout: 10000 });

        // 5. 機能要件 (FN019) の検証: 初期ステータス「勤務外」が表示されていること
        await expect(page.getByText('勤務外')).toBeVisible();
        // 「出勤」ボタンが存在することを確認
        await expect(page.locator('button:has-text("出勤")')).toBeVisible();
    });

    test('未ログインで打刻画面にアクセスした場合、ログイン画面にリダイレクトされる', async ({
        page,
    }) => {
        // 1. 直接 URL を叩く
        await page.goto('/attendance');

        // 2. ログイン画面へ戻されることを確認
        await expect(page).toHaveURL(/\/login/);
    });

    test('管理者ユーザーが管理者ログインから正常にログインできる', async ({
        page,
    }) => {
        // 1. 管理者ログイン画面へアクセス
        await page.goto('/admin/login');

        // 2. 管理者情報を入力
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'adminpass');

        // 3. ログイン
        await page.click('button[type="submit"]');

        // 4. 管理者用トップ（日次勤怠一覧）への遷移を確認
        await expect(page).toHaveURL(/\/admin\/attendance\/list/, {
            timeout: 10000,
        });
        // 管理者画面のヘッダータイトルを確認
        await expect(page.locator('header')).toContainText('勤怠');
    });
});
