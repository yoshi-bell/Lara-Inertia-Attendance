import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { loginSchema, type LoginFormType } from '@/schemas/authSchema';

/**
 * ログイン画面 (US002, US004 対応)
 *
 * 【設計意図】
 * 1. デザイン: 旧プロジェクト auth/login.blade.php のトンマナを Tailwind CSS で忠実に再現。
 * 2. 堅牢性: Zod (loginSchema) によるフロントエンド検証を統合。
 * 3. 汎用性: 一般ユーザーと管理者のログイン画面で共通のバリデーションメッセージ基盤 (JSON) を使用。
 *
 * @returns {JSX.Element} ログインコンポーネント
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
    } = useForm<LoginFormType & { remember: boolean }>({
        email: '',
        password: '',
        remember: false,
    });

    /**
     * Zod によるフロントエンドバリデーション
     *
     * 【Why: 一貫した UX】
     * Register.tsx と同様、バックエンドの挙動に合わせて各フィールドの「最初のエラー」のみを表示する。
     *
     * @returns {boolean} 検証通過時に true
     */
    const validate = (): boolean => {
        clearErrors();
        const result = loginSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof LoginFormType, string>> = {};

            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof LoginFormType;
                if (!fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            });

            Object.entries(fieldErrors).forEach(([path, message]) => {
                setError(path as keyof LoginFormType, message);
            });

            return false;
        }
        return true;
    };

    /**
     * フォーム送信処理
     */
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // 送信前にフロント側で検証
        if (!validate()) return;

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AttendanceLayout backgroundColor="#FFFFFF">
            <Head title="ログイン" />

            <div className="mx-auto mt-[60px] max-w-[680px] px-4 sm:px-0">
                {/* ログインタイトル */}
                <div className="mb-[60px]">
                    <h1 className="text-center text-[36px] font-bold text-black">
                        ログイン
                    </h1>
                </div>

                <form onSubmit={submit} noValidate className="space-y-[14px]">
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
                                autoComplete="username"
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
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
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
                            ログインする
                        </button>
                    </div>
                </form>

                {/* 各種リンク */}
                <div className="mt-[30px] space-y-2 text-center">
                    <div>
                        <Link
                            href={route('password.request')}
                            className="text-[18px] text-[#0073CC] transition-opacity hover:opacity-70"
                        >
                            パスワードをお忘れの方はこちら
                        </Link>
                    </div>
                    <div>
                        <Link
                            href={route('register')}
                            className="text-[20px] text-[#0073CC] transition-opacity hover:opacity-70"
                        >
                            会員登録はこちら
                        </Link>
                    </div>
                </div>
            </div>
        </AttendanceLayout>
    );
}
