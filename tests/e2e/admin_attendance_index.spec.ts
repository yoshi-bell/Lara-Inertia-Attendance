import { test, expect } from '@playwright/test';
import { format, subMonths } from 'date-fns';

/**
 * 管理者：日次勤怠一覧の検証 (US010, US011 対応)
 * UI から現在の年月を読み取り、論理的に正しい前月へ移動して検証する「現場主義」テスト
 */
test.describe('管理者：日次勤怠一覧', () => {

    test('DatePickerで過去に移動してから、前日・翌日遷移を検証する', async ({ page }) => {
        // 1. 管理者ログイン
        await page.goto('/admin/login');
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'adminpass');
        await page.getByRole('button', { name: '管理者ログインする' }).click();
        
        // ログイン完了を待機
        await expect(page).toHaveURL(/\/admin\/attendance\/list/);

        const dateDisplay = page.locator('button:has(svg.lucide-calendar) span');

        // ==========================================
        // 2. DatePicker で「先月の15日」へワープ
        // ==========================================
        
        // カレンダーを開く
        await page.locator('button:has(svg.lucide-calendar)').click();

        // ターゲットとなるキャプション要素
        const captionLocator = page.locator('.rdp-caption_label, .rdp-month_caption').first();

        // 現在表示されている年月を読み取る (例: "2024年12月")
        const currentCaptionText = await captionLocator.innerText();

        // 文字列から数字を抽出 (例: ["2024", "12"])
        const matches = currentCaptionText.match(/\d+/g);
        if (!matches || matches.length < 2) {
            throw new Error(`年月の取得に失敗しました: ${currentCaptionText}`);
        }

        const currentYear = parseInt(matches[0], 10);
        const currentMonth = parseInt(matches[1], 10);

        // 論理的な「1ヶ月前」を計算
        const currentDateObj = new Date(currentYear, currentMonth - 1, 1);
        const prevMonthDateObj = subMonths(currentDateObj, 1);
        const expectedCaption = format(prevMonthDateObj, 'yyyy年M月'); 

        // 【強力なリトライロジック】前月ボタンを「期待した月になるまで」押す
        await expect(async () => {
            const prevButton = page.getByRole('button', { name: /previous/i });
            if (await prevButton.isVisible()) {
                await prevButton.click({ force: true });
            } else {
                await page.locator('.rdp-button_previous').click({ force: true });
            }
            
            // 画面の表示が「計算した正解」と一致することを確認
            await expect(captionLocator).toHaveText(expectedCaption, { timeout: 1000 });
        }).toPass({
            intervals: [500, 1000],
            timeout: 15000
        });

        // 「15日」をクリック
        await page.getByRole('gridcell', { name: '15', exact: true }).click();

        // 【検証】URLと表示が「計算上の15日」になっていること
        const targetDateStr = format(prevMonthDateObj, 'yyyy-MM-'); // "2024-11-"
        const urlRegex = new RegExp(`date=${targetDateStr}15`); 
        await expect(page).toHaveURL(urlRegex);

        const expectedDisplayDate = format(prevMonthDateObj, 'M月15日');
        await expect(dateDisplay).toContainText(expectedDisplayDate);

        // データが存在すること（詳細リンクが見えているか）を確認
        await expect(page.getByRole('link', { name: '詳細' }).first()).toBeVisible();


        // ==========================================
        // 3. その地点から「翌日」へ移動
        // ==========================================
        await page.getByRole('link', { name: '翌日' }).click();

        const nextDayStr = `${targetDateStr}16`;
        const nextDayDisplay = format(prevMonthDateObj, 'M月16日');

        await expect(page).toHaveURL(new RegExp(`date=${nextDayStr}`));
        await expect(dateDisplay).toContainText(nextDayDisplay);


        // ==========================================
        // 4. その地点から「前日」へ戻る（元の15日へ）
        // ==========================================
        await page.getByRole('link', { name: '前日' }).click();

        await expect(page).toHaveURL(urlRegex);
        await expect(dateDisplay).toContainText(expectedDisplayDate);
    });
});
