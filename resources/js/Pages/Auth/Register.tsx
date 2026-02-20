import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    registerSchema,
    type RegisterFormType,
} from '@/schemas/authSchema';

/**
 * 会員登録画面 (US001 対応)
 *
 * 【設計意図】
 * 1. デザイン: 旧プロジェクト auth/register.blade.php のトンマナを Tailwind CSS で忠実に再現。
 * 2. 堅牢性: Zod (registerSchema) を用いたクライアントサイド検証を統合し、送信前の即時フィードバックを実現。
 * 3. SSOT: バリデーションメッセージは validation_messages.json から一元的に取得し、バックエンドと同期。
 *
 * @returns {JSX.Element} 会員登録コンポーネント
 */
export default function Register() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm<RegisterFormType>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    /**
     * Zod によるフロントエンドバリデーションの実行
     *
     * 【Why: メッセージ優先順位の同期】
     * Zod は全フィールドのエラーを一度に返すが、ユーザー体験を Laravel (バックエンド) の
     * 標準的な挙動（必須チェック優先等）に合わせるため、各フィールドの「最初の一個目」
     * のエラーのみを抽出してセットする。
     *
     * @returns {boolean} バリデーションを通過した場合は true
     */
    const validate = (): boolean => {
        clearErrors();
        const result = registerSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof RegisterFormType, string>> =
                {};

            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof RegisterFormType;
                // 既にエラーが記録されているフィールドはスキップ（先勝ち = 優先度高）
                if (!fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            });

            // Inertia の errors ステートに Zod のエラーを同期
            Object.entries(fieldErrors).forEach(([path, message]) => {
                setError(path as keyof RegisterFormType, message);
            });

            return false;
        }
        return true;
    };

    /**
     * フォーム送信処理
     * フロントエンドでの検証通過後、バックエンドへ POST リクエストを行う。
     */
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // 送信前にフロント側で検証
        if (!validate()) return;

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AttendanceLayout backgroundColor="#FFFFFF">
            <Head title="会員登録" />

            <div className="mx-auto mt-[42px] max-w-[680px] px-4 sm:px-0">
                {/* 会員登録タイトル */}
                <div className="mb-[40px]">
                    <h1 className="text-center text-[36px] font-bold text-black">
                        会員登録
                    </h1>
                </div>

                <form onSubmit={submit} noValidate className="space-y-[14px]">
                    {/* 名前入力 */}
                    <div className="form__group flex flex-col">
                        <label
                            htmlFor="name"
                            className="mb-1 text-[24px] font-bold text-black"
                        >
                            名前
                        </label>
                        <div className="h-[70px]">
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-[45px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.name && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* メールアドレス入力 */}
                    <div className="form__group flex flex-col">
                        <label
                            htmlFor="email"
                            className="mb-1 text-[24px] font-bold text-black"
                        >
                            メールアドレス
                        </label>
                        <div className="h-[70px]">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-[45px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
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
                        <div className="h-[70px]">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-[45px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.password && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* パスワード確認入力 */}
                    <div className="form__group flex flex-col">
                        <label
                            htmlFor="password_confirmation"
                            className="mb-1 text-[24px] font-bold text-black"
                        >
                            パスワード確認
                        </label>
                        <div className="h-[70px]">
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                className="h-[45px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 登録ボタン */}
                    <div className="pt-[50px]">
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-[60px] w-full rounded-[5px] bg-black text-[26px] font-bold text-white transition-opacity hover:opacity-70 disabled:opacity-50"
                        >
                            登録する
                        </button>
                    </div>
                </form>

                {/* ログインへのリンク */}
                <div className="mt-[30px] text-center">
                    <Link
                        href={route('login')}
                        className="text-[20px] text-[#0073CC] transition-opacity hover:opacity-70"
                    >
                        ログインはこちら
                    </Link>
                </div>
            </div>
        </AttendanceLayout>
    );
}
