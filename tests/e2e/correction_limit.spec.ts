/* cspell:ignore usertest */
import { test, expect } from '@playwright/test';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * 勤怠修正制限の E2E テスト
 * 勤務状態 (is_editable) に応じた UI の動的変化を検証する「RPG脳」テスト
 */
test.describe('勤怠修正の制限検証', () => {
    
    test.beforeEach(async () => {
        // 各テスト開始前の準備 (現在は引数不要)
    });

    test('勤務中は修正不可だが、退勤すると修正可能になる（UI連動テスト）', async ({ page }) => {
        const todayMonthDay = formatInTimeZone(new Date(), 'Asia/Tokyo', 'MM/dd');
        console.log(`Searching for today's row with text: "${todayMonthDay}"`);

        // 1. ログイン
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test5@example.com');
        await page.fill('input[name="password"]', 'usertest');
        await page.getByRole('button', { name: 'ログインする' }).click();
        await expect(page).toHaveURL(/\/attendance/);

        // 2. 出勤ボタンをクリックして「勤務中」にする
        await page.getByRole('button', { name: '出勤' }).click();
        await expect(page.getByText('勤務中')).toBeVisible();

        // 3. 勤怠一覧へ移動し、当日のデータの詳細を開く
        await page.goto('/attendance/list');
        
        // 今日の日付を含む行の「詳細」リンクを特定してクリック
        const todayRow = page.locator('tr').filter({ hasText: todayMonthDay });
        await expect(todayRow).toBeVisible();
        await todayRow.getByRole('link', { name: '詳細' }).click();

        // 【検証】詳細画面へ遷移し、修正ボタンが非活性であり、ポジティブな案内メッセージが表示されていること
        await expect(page).toHaveURL(/\/attendance\/detail\/\d+/);
        await expect(page.getByText('※当日の修正は退勤後に行えます')).toBeVisible();
        await expect(page.getByRole('button', { name: '修正' })).toBeDisabled();

        // 4. 打刻画面に戻り、退勤ボタンをクリックして「勤務終了」にする
        await page.goto('/attendance');
        await page.getByRole('button', { name: '退勤' }).click();
        await expect(page.getByText('勤務終了')).toBeVisible();

        // 5. 再度一覧から当日の詳細を開く
        await page.goto('/attendance/list');
        const updatedTodayRow = page.locator('tr').filter({ hasText: todayMonthDay });
        await updatedTodayRow.getByRole('link', { name: '詳細' }).click();

        // 【検証】修正ボタンが活性化し、案内メッセージが消えていること
        await expect(page).toHaveURL(/\/attendance\/detail\/\d+/);
        await expect(page.getByText('※当日の修正は退勤後に行えます')).not.toBeVisible();
        await expect(page.getByRole('button', { name: '修正' })).toBeEnabled();
    });
});
