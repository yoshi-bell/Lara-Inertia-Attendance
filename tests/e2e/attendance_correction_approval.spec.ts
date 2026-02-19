import { test, expect } from '@playwright/test';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * 勤怠修正・承認ワークフローの E2E テスト
 * 一般ユーザーの申請が管理者に届き、承認されるまでのリレーを検証する
 * 月初問題や非同期遷移を考慮した「必勝」のシナリオ
 */
test.describe('勤怠修正・承認ワークフロー', () => {
    test('一般ユーザーの申請が管理者に届き、承認されるまでの一連の流れを検証', async ({
        page,
    }) => {
        // --- 1. 一般ユーザー：修正申請の送信 ---
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test4@example.com');
        await page.fill('input[name="password"]', 'usertest');
        await page.getByRole('button', { name: 'ログインする' }).click();

        // ログイン処理（リダイレクト）の完了を待機
        await expect(page).toHaveURL(/\/attendance/);

        // 勤怠一覧画面へ移動
        await page.goto('/attendance/list');

        // 日本時間の「昨日」の日付を取得
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayMonthDay = formatInTimeZone(yesterday, 'Asia/Tokyo', 'MM/dd');

        /**
         * 【舞台装置の活用】
         * シーダーで確実に作成された「test4 の昨日（申請なし）」のデータを狙い撃ちする。
         */
        const targetRow = page.locator('tr').filter({ hasText: yesterdayMonthDay });
        await expect(targetRow).toBeVisible();
        await targetRow.getByRole('link', { name: '詳細' }).click();

        // 修正理由を入力して送信 (ユニークな理由を生成)
        const reason = `E2E承認リレーテスト: ${Date.now()}`;
        await page.fill('textarea', reason);
        await page.getByRole('button', { name: '修正' }).click();

        // 送信後、詳細画面で「承認待ち」の警告が表示されていることを確認
        await expect(
            page.getByText('承認待ちの申請があるため修正はできません')
        ).toBeVisible();

        // ログアウト (セッションをクリア)
        await page.getByRole('button', { name: 'ログアウト' }).click();
        await expect(page).toHaveURL(/\/login/);

        // --- 2. 管理者：承認の実行 ---
        await page.goto('/admin/login');
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'adminpass');
        await page.getByRole('button', { name: '管理者ログインする' }).click();

        // 管理者画面への遷移を待機
        await expect(page).toHaveURL(/\/admin\/attendance\/list/, {
            timeout: 10000,
        });

        // 管理者用申請一覧へ移動
        await page.goto('/admin/stamp_correction_request/list');
        // 送信した申請理由が含まれる行を探して詳細画面へ
        const adminRequestRow = page.locator('tr').filter({ hasText: reason });
        await expect(adminRequestRow).toBeVisible();
        await adminRequestRow.getByRole('link', { name: '詳細' }).click();

        // 承認ボタンをクリック
        await page.getByRole('button', { name: '承認' }).click();

        // 承認済みステータスに切り替わったことを確認
        await expect(page.getByText('承認済み')).toBeVisible();

        // ログアウト
        await page.getByRole('button', { name: 'ログアウト' }).click();
        await expect(page).toHaveURL(/\/admin\/login/);

        // --- 3. 一般ユーザー：結果の確認 ---
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test4@example.com');
        await page.fill('input[name="password"]', 'usertest');
        await page.getByRole('button', { name: 'ログインする' }).click();
        await expect(page).toHaveURL(/\/attendance/);

        // 一般用申請一覧の「承認済み」タブを確認
        await page.goto('/stamp_correction_request/list?status=approved');
        // 自分の申請が承認済みリストに含まれていることを確認
        await expect(
            page.locator('tr').filter({ hasText: reason })
        ).toBeVisible();
    });
});
