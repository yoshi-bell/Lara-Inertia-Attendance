import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DatePicker from './DatePicker';

/**
 * DatePicker コンポーネントの単体テスト
 * E2E で発生した「タイトルと日付の不整合」をコードレベルで解明する
 */
describe('DatePicker Component', () => {
    const mockOnChange = vi.fn();

    it('初期表示で指定した日付が正しいフォーマット（yyyy/MM/dd）で表示されていること', () => {
        render(<DatePicker date="2026-02-13" onChange={mockOnChange} />);

        // ボタンのラベルを確認 (FN018 等の表示形式に準拠しているか)
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('2026/02/13');
    });

    it('カレンダーを展開し、日付を選択すると正しい値（YYYY-MM-DD）で onChange が呼ばれること', async () => {
        const user = userEvent.setup();
        render(<DatePicker date="2026-02-13" onChange={mockOnChange} />);

        const button = screen.getByRole('button');

        // カレンダー（Popover）を展開
        await user.click(button);

        // カレンダーグリッド内の「15」日を特定してクリック
        // ※ react-day-picker の構造上、日付は button タグとしてレンダリングされる
        const day15 = await screen.findByText('15', { selector: 'button' });
        await user.click(day15);

        // 親コンポーネントに正しい日付文字列が渡されているか検証
        expect(mockOnChange).toHaveBeenCalledWith('2026-02-15');
    });

    it('ナビゲーションボタンで月を切り替えた際、カレンダーのタイトルが連動して更新されること', async () => {
        const user = userEvent.setup();
        render(<DatePicker date="2026-02-13" onChange={mockOnChange} />);

        await user.click(screen.getByRole('button'));

        // 初期表示月（2月）の確認
        // Shadcn UI (jaロケール) の標準的なキャプション形式を期待
        expect(screen.getByText(/2026年2月/)).toBeInTheDocument();

        // 「前月」ボタンをクリック
        // クラス名 .rdp-button_previous は react-day-picker の標準
        const prevButton = document.querySelector('.rdp-button_previous');
        if (!prevButton) throw new Error('前月ボタンが DOM 上に見つかりません');

        await user.click(prevButton);

        // 【ここが E2E での不具合疑い箇所】
        // タイトルが「2026年1月」に更新されているかを厳密にチェック
        expect(screen.getByText(/2026年1月/)).toBeInTheDocument();
    });
});
