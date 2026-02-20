import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ForgotPassword from './ForgotPassword';
import React, { useState } from 'react';

/**
 * ForgotPassword コンポーネントの単体テスト
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

describe('ForgotPassword Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('初期表示で正しくレンダリングされること', () => {
        render(<ForgotPassword />);
        expect(
            screen.getByRole('heading', { name: 'パスワード再設定' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: '再設定用リンクを送信' })
        ).toBeInTheDocument();
    });

    it('不正な形式のメールで送信した際、エラーが表示されること', async () => {
        render(<ForgotPassword />);
        
        const emailInput = screen.getByLabelText('メールアドレス');
        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        });

        const submitButton = screen.getByRole('button', { name: '再設定用リンクを送信' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(screen.getByText('正しいメールアドレスの形式で入力してください')).toBeInTheDocument();
        expect(mockPost).not.toHaveBeenCalled();
    });

    it('正しい入力の場合、送信処理が実行されること', async () => {
        render(<ForgotPassword />);

        const emailInput = screen.getByLabelText('メールアドレス');
        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        });

        const submitButton = screen.getByRole('button', { name: '再設定用リンクを送信' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockPost).toHaveBeenCalled();
    });
});
