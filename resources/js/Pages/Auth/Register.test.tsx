import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from './Register';
import React, { useState } from 'react';

/**
 * Register コンポーネントの単体テスト (Zod 統合検証)
 */

// 1. route() ヘルパーのモック
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
                auth: { user: null },
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

describe('Register Page (Zod Validation)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('初期表示で正しくレンダリングされること', () => {
        render(<Register />);
        expect(
            screen.getByRole('heading', { name: '会員登録' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('名前')).toBeInTheDocument();
        expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: '登録する' })
        ).toBeInTheDocument();
    });

    it('空の状態で送信した際、Zod による必須バリデーションエラーが表示されること', async () => {
        render(<Register />);
        const submitButton = screen.getByRole('button', { name: '登録する' });

        await act(async () => {
            fireEvent.click(submitButton);
        });

        // 自動再描画により、メッセージを確認可能
        expect(screen.getByText('お名前を入力してください')).toBeInTheDocument();
        expect(
            screen.getByText('メールアドレスを入力してください')
        ).toBeInTheDocument();

        expect(mockPost).not.toHaveBeenCalled();
    });

    it('パスワードが8文字未満の場合、エラーメッセージが表示されること', async () => {
        render(<Register />);

        // パスワードを入力 (8文字未満)
        const passwordInput = screen.getByLabelText('パスワード');
        await act(async () => {
            fireEvent.change(passwordInput, { target: { value: '123' } });
        });

        const submitButton = screen.getByRole('button', { name: '登録する' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(
            screen.getByText('パスワードは8文字以上で入力してください')
        ).toBeInTheDocument();
    });

    it('パスワードと確認用が一致しない場合、エラーが表示されること', async () => {
        render(<Register />);

        // 一致しないパスワードを入力
        const passwordInput = screen.getByLabelText('パスワード');
        const confirmInput = screen.getByLabelText('パスワード確認');

        await act(async () => {
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'different456' } });
        });

        const submitButton = screen.getByRole('button', { name: '登録する' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(screen.getByText('パスワードと一致しません')).toBeInTheDocument();
    });
});
