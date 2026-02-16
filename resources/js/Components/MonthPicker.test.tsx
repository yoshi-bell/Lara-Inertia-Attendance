import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, vi, afterEach } from 'vitest';
import MonthPicker from './MonthPicker';

describe('MonthPicker Component', () => {
    const mockOnChange = vi.fn();

    // テストごとのクリーンアップ
    afterEach(() => {
        cleanup();
        mockOnChange.mockClear();
    });

    it('初期表示で指定した年月が正しいフォーマット（yyyy/MM）で表示されていること', () => {
        render(<MonthPicker month="2026年02月" onChange={mockOnChange} />);
        
        // トリガーボタンを探す際は、ボタン内のテキストで探すと確実
        const triggerButton = screen.getByRole('button', { name: '2026/02' });
        expect(triggerButton).toBeInTheDocument();
    });

    it('年次ナビゲーション（前年・翌年）が正しく機能すること', async () => {
        const user = userEvent.setup();
        render(<MonthPicker month="2026年02月" onChange={mockOnChange} />);

        // ポップオーバーを開く
        await user.click(screen.getByRole('button', { name: '2026/02' }));

        // ヘッダーの年表示を確認
        expect(screen.getByText('2026年')).toBeInTheDocument();

        // aria-label を使ってボタンを特定（クラス名やアイコン実装への依存を排除）
        const prevButton = screen.getByRole('button', { name: '前年' });
        const nextButton = screen.getByRole('button', { name: '翌年' });

        // 前年へ
        await user.click(prevButton);
        expect(screen.getByText('2025年')).toBeInTheDocument();

        // 翌年へ（2回押して2027年へ）
        await user.click(nextButton);
        await user.click(nextButton);
        expect(screen.getByText('2027年')).toBeInTheDocument();
    });

    it('月を選択すると、正しいYYYY-MM形式で onChange が呼ばれること', async () => {
        const user = userEvent.setup();
        render(<MonthPicker month="2026年02月" onChange={mockOnChange} />);

        // ポップオーバーを開く
        await user.click(screen.getByRole('button', { name: '2026/02' }));

        // 「3月」をクリック
        const marchButton = screen.getByRole('button', { name: '3月' });
        await user.click(marchButton);

        // 期待値: 2026-03
        expect(mockOnChange).toHaveBeenCalledWith('2026-03');
    });
});
