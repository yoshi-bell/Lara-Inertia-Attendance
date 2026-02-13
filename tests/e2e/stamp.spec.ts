import { test, expect } from '@playwright/test';

/**
 * 打刻機能のフルサイクル検証 (US006, FN021, FN022 対応)
 * 複数回の休憩を含む一連のステータス遷移を確認する「将軍の視点」テスト
 */
test.describe('打刻アクション', () => {
    test('出勤・複数回の休憩・退勤が、正しいステータス遷移を伴って実行できる', async ({
        page,
    }) => {
        // 1. ログイン
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test1@example.com');
        await page.fill('input[name="password"]', 'usertest');
        // getByRole を使用して堅牢なボタン特定を行う
        await page.getByRole('button', { name: 'ログインする' }).click();

        await expect(page).toHaveURL(/\/attendance/);

        // 2. 出勤
        const startButton = page.getByRole('button', { name: '出勤' });
        await expect(startButton).toBeVisible();
        await startButton.click();
        await expect(page.getByText('勤務中')).toBeVisible();

        // 各アクションの間に待機時間を設け、DB上の記録時刻に確実に差をつける
        await page.waitForTimeout(1100);

        // 3. 休憩1回目 (開始・終了)
        await page.getByRole('button', { name: '休憩入' }).click();
        await expect(page.getByText('休憩中')).toBeVisible();
        await page.waitForTimeout(1100);
        await page.getByRole('button', { name: '休憩戻' }).click();
        await expect(page.getByText('勤務中')).toBeVisible();

        await page.waitForTimeout(1100);

        // 4. 休憩2回目 (複数回可の検証 - FN021)
        const secondRestButton = page.getByRole('button', { name: '休憩入' });
        await expect(secondRestButton).toBeVisible();
        await secondRestButton.click();
        await expect(page.getByText('休憩中')).toBeVisible();
        await page.waitForTimeout(1100);
        await page.getByRole('button', { name: '休憩戻' }).click();
        await expect(page.getByText('勤務中')).toBeVisible();

        await page.waitForTimeout(1100);

        // 5. 退勤
        const endWorkButton = page.getByRole('button', { name: '退勤' });
        await expect(endWorkButton).toBeVisible();
        await endWorkButton.click();

        // ステータスが「勤務終了」になり、メッセージが表示されることを確認 (FN022)
        await expect(page.getByText('勤務終了')).toBeVisible();
        await expect(page.getByText('お疲れ様でした。')).toBeVisible();
    });
});
