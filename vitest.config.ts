import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest 設定ファイル
 * フロントエンドコンポーネント（DatePicker等）の単体テスト用
 */
export default defineConfig({
    plugins: [react()],
    test: {
        // ブラウザ環境のエミュレート
        environment: 'jsdom',
        // global な expect, describe 等を有効化
        globals: true,
        // テスト開始前に実行するスクリプト
        setupFiles: './tests/Unit/Frontend/setup.ts',
        // テスト対象ファイル
        include: ['resources/js/**/*.test.{ts,tsx}', 'tests/Unit/Frontend/**/*.test.{ts,tsx}'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});
