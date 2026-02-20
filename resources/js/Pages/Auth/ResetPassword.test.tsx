import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPassword from './ResetPassword';
import React, { useState } from 'react';

/**
 * ResetPassword コンポーネントの単体テスト
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

describe('ResetPassword Page', () => {
    const props = { token: 'test-token', email: 'test@example.com' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('初期表示で正しくレンダリングされること', () => {
        render(<ResetPassword {...props} />);
        expect(
            screen.getByRole('heading', { name: 'パスワードの更新' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('メールアドレス')).toHaveValue(props.email);
        expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument();
    });

    it('パスワードが一致しない場合、バリデーションエラーが表示されること', async () => {
        render(<ResetPassword {...props} />);
        
        const passwordInput = screen.getByLabelText('新しいパスワード');
        const confirmInput = screen.getByLabelText('パスワード確認');
        
        await act(async () => {
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'different456' } });
        });

        const submitButton = screen.getByRole('button', { name: 'パスワードを更新' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(screen.getByText('パスワードと一致しません')).toBeInTheDocument();
        expect(mockPost).not.toHaveBeenCalled();
    });

    it('正しい入力の場合、送信処理が実行されること', async () => {
        render(<ResetPassword {...props} />);

        const passwordInput = screen.getByLabelText('新しいパスワード');
        const confirmInput = screen.getByLabelText('パスワード確認');

        await act(async () => {
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'password123' } });
        });

        const submitButton = screen.getByRole('button', { name: 'パスワードを更新' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockPost).toHaveBeenCalled();
    });
});
