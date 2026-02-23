import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { performZodValidation } from '@/lib/validation';
import {
    forgotPasswordSchema,
    type ForgotPasswordFormType,
} from '@/schemas/authSchema';

/**
 * パスワード再設定メール送信画面
 *
 * 【設計意図】
 * 1. デザイン: 他の認証画面と統一した「Atte」ブランドのトンマナを適用。
 * 2. 堅牢性: Zod (forgotPasswordSchema) によるフロントエンド検証を統合。
 * 3. ユーザー体験: 送信ボタン押下時に即座にバリデーション結果を表示。
 *
 * @param {Object} props
 * @param {string} [props.status] メール送信後のステータスメッセージ
 * @returns {JSX.Element} パスワード忘れ画面コンポーネント
 */
export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm<ForgotPasswordFormType>({
            email: '',
        });

    /**
     * Zod によるフロントエンドバリデーション
     *
     * 【Why: 共通ユーティリティの活用】
     * フォーム管理のボイラープレートを削減し、一貫したエラー表示を実現。
     *
     * @returns {boolean} バリデーション通過時に true
     */
    const validate = (): boolean => {
        clearErrors();
        const result = forgotPasswordSchema.safeParse(data);

        return performZodValidation(
            result,
            setError as (path: string, message: string) => void
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validate()) return;

        post(route('password.email'));
    };

    return (
        <AttendanceLayout backgroundColor="#FFFFFF">
            <Head title="パスワード再設定" />

            <div className="mx-auto mt-[60px] max-w-[680px] px-4 sm:px-0">
                <div className="mb-[40px] text-center">
                    <h1 className="text-[36px] font-bold text-black">
                        パスワード再設定
                    </h1>
                </div>

                <div className="mb-6 text-[18px] font-bold text-gray-600">
                    パスワードをお忘れですか？
                    <br />
                    ご登録のメールアドレスを入力していただければ、新しいパスワードを選択できる再設定用リンクをメールでお送りします。
                </div>

                {status && (
                    <div className="mb-6 text-[18px] font-bold text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} noValidate className="space-y-[14px]">
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
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="h-[60px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.email && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-[36px]">
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-[60px] w-full rounded-[5px] bg-black text-[22px] font-bold text-white transition-opacity hover:opacity-70 disabled:opacity-50"
                        >
                            再設定用リンクを送信
                        </button>
                    </div>
                </form>
            </div>
        </AttendanceLayout>
    );
}
