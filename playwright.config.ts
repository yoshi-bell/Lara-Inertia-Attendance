import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 * リファクタリング後の品質担保のための「将軍の視点」
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['list']],

    // テスト実行時のみ自動でサーバーを立ち上げる設定
    webServer: {
        command: 'php artisan serve --env=testing --port=8081',
        port: 8081,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },

    use: {
        // テスト用サーバーの URL
        baseURL: 'http://127.0.0.1:8081',
        // 失敗時にトレースとスクリーンショットを記録
        trace: 'on-first-retry',
        screenshot: 'on',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
