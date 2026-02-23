import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { performZodValidation } from '@/lib/validation';
import {
    resetPasswordSchema,
    type ResetPasswordFormType,
} from '@/schemas/authSchema';

/**
 * パスワード再設定フォーム画面
 *
 * 【設計意図】
 * 1. デザイン: 会員登録画面と共通のトンマナを採用し、ブランドの一貫性を保持。
 * 2. 堅牢性: Zod (resetPasswordSchema) によるフロントエンド検証を統合。
 * 3. ユーザー体験: パスワード不一致などを送信前に検知可能。
 *
 * @param {Object} props
 * @param {string} props.token 再設定用トークン
 * @param {string} props.email 再設定対象のメールアドレス
 * @returns {JSX.Element} パスワード再設定画面コンポーネント
 */
export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm<ResetPasswordFormType>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    /**
     * Zod によるフロントエンドバリデーション
     * 
     * 【Why: 共通ユーティリティの活用】
     * 複雑な相関チェック（パスワード一致）を含む検証を、ユーティリティで簡潔に記述。
     *
     * @returns {boolean} バリデーション通過時に true
     */
    const validate = (): boolean => {
        clearErrors();
        const result = resetPasswordSchema.safeParse(data);

        return performZodValidation(
            result,
            setError as (path: string, message: string) => void
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validate()) return;

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AttendanceLayout backgroundColor="#FFFFFF">
            <Head title="パスワードの更新" />

            <div className="mx-auto mt-[60px] max-w-[680px] px-4 sm:px-0">
                <div className="mb-[40px] text-center">
                    <h1 className="text-[36px] font-bold text-black">
                        パスワードの更新
                    </h1>
                </div>

                <form onSubmit={submit} noValidate className="space-y-[14px]">
                    {/* トークン (Hidden) */}
                    <input type="hidden" name="token" value={data.token} />

                    {/* メールアドレス入力 (読み取り専用に近いが入力可能) */}
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
                            新しいパスワード
                        </label>
                        <div className="h-[116px]">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="new-password"
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

                    {/* パスワード確認 */}
                    <div className="form__group flex flex-col">
                        <label
                            htmlFor="password_confirmation"
                            className="mb-1 text-[24px] font-bold text-black"
                        >
                            パスワード確認
                        </label>
                        <div className="h-[116px]">
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                className="h-[60px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-[36px]">
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-[60px] w-full rounded-[5px] bg-black text-[26px] font-bold text-white transition-opacity hover:opacity-70 disabled:opacity-50"
                        >
                            パスワードを更新
                        </button>
                    </div>
                </form>
            </div>
        </AttendanceLayout>
    );
}
