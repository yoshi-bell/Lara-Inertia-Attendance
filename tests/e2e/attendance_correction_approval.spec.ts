import { test, expect } from '@playwright/test';
import { format, subDays } from 'date-fns';

/**
 * 勤怠修正・承認ワークフローの E2E テスト
 * (一般ユーザーによる修正申請 -> 管理者による承認 -> 一般ユーザーによる確認)
 * ファイル名: attendance_correction_approval.spec.ts
 */
test.describe('勤怠修正・承認ワークフロー', () => {
    
    test('一般ユーザーの申請が管理者に届き、承認されるまでの一連の流れを検証', async ({ page }) => {
        // 昨日の日付文字列を取得 (一覧画面でのマッチング用: 例 "02/12")
        const yesterday = subDays(new Date(), 1);
        const yesterdayMonthDay = format(yesterday, 'MM/dd');

        // --- 1. 一般ユーザー：修正申請の送信 ---
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test1@example.com');
        await page.fill('input[name="password"]', 'usertest');
        await page.getByRole('button', { name: 'ログインする' }).click();
        await expect(page).toHaveURL(/\/attendance/);

        // 勤怠一覧画面へ移動
        await page.goto('/attendance/list');
        
        // 昨日の行の「詳細」リンクをクリック
        const yesterdayRow = page.locator('tr').filter({ hasText: yesterdayMonthDay });
        await expect(yesterdayRow).toBeVisible();
        await yesterdayRow.getByRole('link', { name: '詳細' }).click();

        // 修正理由を入力して送信
        const reason = `E2E修正テスト: ${Date.now()}`;
        await page.fill('textarea', reason);
        await page.getByRole('button', { name: '修正' }).click();

        // 送信後、詳細画面で「承認待ち」の警告が表示されていることを確認
        await expect(page.getByText('承認待ちの申請があるため修正はできません')).toBeVisible();
        
        // ログアウト
        await page.getByRole('button', { name: 'ログアウト' }).click();

        // --- 2. 管理者：承認の実行 ---
        await page.goto('/admin/login');
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'adminpass');
        await page.getByRole('button', { name: '管理者ログインする' }).click();

        // 管理者用申請一覧へ移動
        await page.goto('/admin/stamp_correction_request/list');
        
        // 先程の申請理由が含まれる行を探して詳細画面へ
        const adminRequestRow = page.locator('tr').filter({ hasText: reason });
        await expect(adminRequestRow).toBeVisible();
        await adminRequestRow.getByRole('link', { name: '詳細' }).click();

        // 承認ボタンをクリック
        await page.getByRole('button', { name: '承認' }).click();
        
        // 承認済みステータスに切り替わったことを確認
        await expect(page.getByText('承認済み')).toBeVisible();
        
        // ログアウト
        await page.getByRole('button', { name: 'ログアウト' }).click();

        // --- 3. 一般ユーザー：結果の確認 ---
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test1@example.com');
        await page.fill('input[name="password"]', 'usertest');
        await page.getByRole('button', { name: 'ログインする' }).click();

        // 一般用申請一覧の「承認済み」タブを確認
        await page.goto('/stamp_correction_request/list?status=approved');
        // 自分の申請が承認済みリストに含まれていることを確認
        await expect(page.locator('tr').filter({ hasText: reason })).toBeVisible();
    });
});
