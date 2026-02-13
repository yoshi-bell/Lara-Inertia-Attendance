import { test, expect } from '@playwright/test';

/**
 * 勤怠一覧のナビゲーション検証 (US007, US013 共通コンポーネント)
 */
test.describe('勤怠一覧のナビゲーション', () => {
    
    test.beforeEach(async ({ page }) => {
        // テストユーザーでログイン
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test1@example.com');
        await page.fill('input[name="password"]', 'usertest');
        await page.getByRole('button', { name: 'ログインする' }).click();
        
        // ログイン処理（リダイレクト）の完了を待機することでセッションを確実に確立させる
        await expect(page).toHaveURL(/\/attendance/);

        // 一覧画面へ移動
        await page.goto('/attendance/list');
    });

    test('前月・翌月ボタンで1ヶ月ずつ遷移できる', async ({ page }) => {
        const calendarButton = page.locator('button:has(svg.lucide-calendar)');
        const initialMonth = await calendarButton.innerText();

        // 1. 前月ボタンのクリック
        await page.getByRole('link', { name: '前月' }).click();
        await expect(page).toHaveURL(/month=[0-9]{4}-[0-9]{2}/);
        expect(await calendarButton.innerText()).not.toBe(initialMonth);

        // 2. 翌月ボタンのクリック (元の月へ戻る)
        await page.getByRole('link', { name: '翌月' }).click();
        await expect(calendarButton).toHaveText(initialMonth);
    });

    test('月選択ピッカーで現在とは異なる月へ動的に遷移できる', async ({ page }) => {
        const calendarButton = page.locator('button:has(svg.lucide-calendar)');
        const currentMonthText = await calendarButton.innerText(); // 例: "2026/02"

        // ピッカーを開く
        await calendarButton.click();

        /**
         * 堅牢なテストロジック:
         * 現在表示されている月を判定し、それとは必ず異なる月をターゲットにする。
         */
        const isJanuary = currentMonthText.includes('/01');
        const targetMonthName = isJanuary ? '2月' : '1月';
        const targetMonthValue = isJanuary ? '02' : '01';

        // ターゲットの月をクリック
        await page.getByRole('button', { name: targetMonthName, exact: true }).click();

        // 検証: URL パラメータと画面表示がターゲットの月に更新されていること
        const urlPattern = new RegExp('month=[0-9]{4}-' + targetMonthValue);
        await expect(page).toHaveURL(urlPattern);
        await expect(calendarButton).toContainText(`/${targetMonthValue}`);
    });
});
