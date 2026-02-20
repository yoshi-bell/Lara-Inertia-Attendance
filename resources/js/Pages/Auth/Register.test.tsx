import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from './Register';
import React from 'react';

/**
 * Register コンポーネントの単体テスト (Zod 統合検証)
 */

// 1. route() ヘルパーのモック
const mockRoute = vi.fn((name: string) => `http://localhost/${name}`);
vi.stubGlobal('route', mockRoute);

// 2. Inertia モック
const mockPost = vi.fn();
const mockSetData = vi.fn();
const mockSetError = vi.fn();
const mockClearErrors = vi.fn();

// 手動で管理する errors ステートのシミュレーション
let currentErrors: Record<string, string> = {};

vi.mock('@inertiajs/react', () => ({
    useForm: (initialValues: any) => ({
        data: initialValues,
        setData: (key: string, value: any) => {
            initialValues[key] = value;
            mockSetData(key, value);
        },
        post: mockPost,
        processing: false,
        errors: currentErrors,
        reset: vi.fn(),
        setError: (path: string, message: string) => {
            currentErrors[path] = message;
            mockSetError(path, message);
        },
        clearErrors: () => {
            currentErrors = {};
            mockClearErrors();
        },
    }),
    usePage: () => ({
        props: {
            auth: { user: null }, // 会員登録画面なのでユーザーは null
            flash: { success: null, error: null },
        },
    }),
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Register Page (Zod Validation)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        currentErrors = {};
    });

    it('初期表示で正しくレンダリングされること', () => {
        render(<Register />);
        // タイトルと重複するため role で見出しを特定
        expect(screen.getByRole('heading', { name: '会員登録' })).toBeInTheDocument();
        expect(screen.getByLabelText('名前')).toBeInTheDocument();
        expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登録する' })).toBeInTheDocument();
    });

    it('空の状態で送信した際、Zod による必須バリデーションエラーが表示されること', async () => {
        const { rerender } = render(<Register />);
        const submitButton = screen.getByRole('button', { name: '登録する' });

        await act(async () => {
            fireEvent.click(submitButton);
        });

        // 必須チェックが優先されることを確認
        expect(mockSetError).toHaveBeenCalledWith('name', expect.stringContaining('お名前を入力してください'));
        expect(mockSetError).toHaveBeenCalledWith('email', expect.stringContaining('メールアドレスを入力してください'));
        
        rerender(<Register />);
        expect(screen.getByText('お名前を入力してください')).toBeInTheDocument();
        expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
        
        expect(mockPost).not.toHaveBeenCalled();
    });

    it('パスワードが8文字未満の場合、エラーメッセージが表示されること', async () => {
        const { rerender } = render(<Register />);
        
        // パスワードを入力 (8文字未満)
        const passwordInput = screen.getByLabelText('パスワード');
        await act(async () => {
            fireEvent.change(passwordInput, { target: { value: '123' } });
        });

        const submitButton = screen.getByRole('button', { name: '登録する' });
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(mockSetError).toHaveBeenCalledWith('password', expect.stringContaining('パスワードは8文字以上で入力してください'));
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

        expect(mockSetError).toHaveBeenCalledWith('password_confirmation', expect.stringContaining('パスワードと一致しません'));
    });
});
