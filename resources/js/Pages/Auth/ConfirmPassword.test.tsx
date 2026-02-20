import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfirmPassword from './ConfirmPassword';
import React, { useState } from 'react';

/**
 * ConfirmPassword コンポーネントの単体テスト
 */

// 1. route() モック
const mockRoute = vi.fn((name: string) => `http://localhost/${name}`);
vi.stubGlobal('route', mockRoute);

// 2. Inertia モック (生きたモック版)
const mockPost = vi.fn();

vi.mock('@inertiajs/react', () => {
    return {
        useForm: (initialValues: Record<string, unknown>) => {
            const [data, setDataState] = useState(initialValues);
            const [errors, setErrors] = useState<Record<string, string>>({});

            return {
                data,
                setData: (key: string, value: unknown) =>
                    setDataState((prev: Record<string, unknown>) => ({
                        ...prev,
                        [key]: value,
                    })),
                post: mockPost,
                processing: false,
                errors,
                reset: vi.fn(),
                setError: (path: string, message: string) =>
                    setErrors((prev) => ({ ...prev, [path]: message })),
                clearErrors: () => setErrors({}),
            };
        },
        usePage: () => ({
            props: {
                auth: { user: { name: 'Test User' } }, // ログイン済み想定
                flash: { success: null, error: null },
            },
        }),
        Head: ({ title }: { title: string }) => <title>{title}</title>,
        Link: ({
            children,
            href,
        }: {
            children: React.ReactNode;
            href: string;
        }) => <a href={href}>{children}</a>,
    };
});

describe('ConfirmPassword Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('初期表示で正しくレンダリングされること', () => {
        render(<ConfirmPassword />);
        expect(
            screen.getByRole('heading', { name: 'パスワードの確認' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    });

    it('未入力で送信した際、バリデーションエラーが表示されること', async () => {
        render(<ConfirmPassword />);
        
        const submitButton = screen.getByRole('button', { name: '確認' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
        expect(mockPost).not.toHaveBeenCalled();
    });

    it('入力がある場合、送信処理が実行されること', async () => {
        render(<ConfirmPassword />);

        const passwordInput = screen.getByLabelText('パスワード');
        await act(async () => {
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
        });

        const submitButton = screen.getByRole('button', { name: '確認' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockPost).toHaveBeenCalled();
    });
});
