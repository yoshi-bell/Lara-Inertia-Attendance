import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { loginSchema, type LoginFormType } from '@/schemas/authSchema';
import { performZodValidation } from '@/lib/validation';

/**
 * 管理者ログイン画面 (US004 対応)
 *
 * 【設計意図】
 * 1. デザイン: 一般ユーザー用ログイン画面と統一した「Atte」ブランドのトンマナを採用。
 * 2. 堅牢性: Zod (loginSchema) によるフロントエンド検証を統合。
 * 3. 共通化: 一般ログインと共通のバリデーションスキーマ・メッセージ基盤 (JSON) を活用。
 *
 * @returns {JSX.Element} 管理者ログインコンポーネント
 */
export default function Login() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm<LoginFormType>({
        email: '',
        password: '',
    });

    /**
     * Zod によるフロントエンドバリデーションの実行
     *
     * 【Why: ユーザー体験の統一】
     * 共通ユーティリティを使用して、各フィールドの「最初の一個目」
     * のエラーのみを表示し、UX を一貫させる。
     *
     * @returns {boolean} バリデーション通過時に true
     */
    const validate = (): boolean => {
        clearErrors();
        const result = loginSchema.safeParse(data);

        return performZodValidation(
            result,
            setError as (path: string, message: string) => void
        );
    };

    /**
     * フォーム送信処理
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 送信前にフロント側で検証
        if (!validate()) return;

        post(route('admin.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AttendanceLayout backgroundColor="#FFFFFF">
            <Head title="管理者ログイン" />

            <div className="mx-auto mt-[60px] max-w-[680px] px-4 sm:px-0">
                {/* 管理者ログインタイトル */}
                <div className="mb-[60px] text-center">
                    <h1 className="text-[36px] font-bold text-black">
                        管理者ログイン
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-[14px]"
                >
                    {/* メールアドレス入力 */}
                    <div className="form__group flex flex-col">
                        <label
                            htmlFor="email"
                            className="mb-1 text-[24px] font-bold text-black"
                        >
                            メールアドレス
                        </label>
                        <div className="h-[116px]">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-[60px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.email && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* パスワード入力 */}
                    <div className="form__group flex flex-col">
                        <label
                            htmlFor="password"
                            className="mb-1 text-[24px] font-bold text-black"
                        >
                            パスワード
                        </label>
                        <div className="h-[116px]">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="h-[60px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.password && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ログインボタン */}
                    <div className="pt-[36px]">
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-[60px] w-full rounded-[5px] bg-black text-[26px] font-bold text-white transition-opacity hover:opacity-70 disabled:opacity-50"
                        >
                            管理者ログインする
                        </button>
                    </div>
                </form>
            </div>
        </AttendanceLayout>
    );
}
