import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import React, { useState } from 'react';

/**
 * Login コンポーネントの単体テスト (Zod 統合検証)
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

describe('Login Page (Zod Validation)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('初期表示で正しくレンダリングされること', () => {
        render(<Login />);
        expect(
            screen.getByRole('heading', { name: 'ログイン' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'ログインする' })
        ).toBeInTheDocument();
    });

    it('空の状態で送信した際、Zod による必須バリデーションエラーが表示されること', async () => {
        render(<Login />);
        const submitButton = screen.getByRole('button', { name: 'ログインする' });

        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(
            screen.getByText('メールアドレスを入力してください')
        ).toBeInTheDocument();
        expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();

        expect(mockPost).not.toHaveBeenCalled();
    });

    it('不正なメール形式の場合、エラーメッセージが表示されること', async () => {
        render(<Login />);

        const emailInput = screen.getByLabelText('メールアドレス');
        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        });

        const submitButton = screen.getByRole('button', { name: 'ログインする' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(
            screen.getByText('正しいメールアドレスの形式で入力してください')
        ).toBeInTheDocument();
    });

    it('正しい入力の場合、送信処理が実行されること', async () => {
        render(<Login />);

        const emailInput = screen.getByLabelText('メールアドレス');
        const passwordInput = screen.getByLabelText('パスワード');

        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
        });

        const submitButton = screen.getByRole('button', { name: 'ログインする' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockPost).toHaveBeenCalled();
    });
});
