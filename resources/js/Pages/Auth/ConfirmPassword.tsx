import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    confirmPasswordSchema,
    type ConfirmPasswordFormType,
} from '@/schemas/authSchema';

/**
 * パスワード確認画面
 *
 * 【設計意図】
 * 1. デザイン: セキュリティ上重要な操作の前の「ブランド体験」を損なわないデザイン統一。
 * 2. 堅牢性: Zod (confirmPasswordSchema) によるフロントエンド検証を統合。
 * 3. ユーザー体験: 必須チェックを送信前に実行。
 *
 * @returns {JSX.Element} パスワード確認コンポーネント
 */
export default function ConfirmPassword() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm<ConfirmPasswordFormType>({
        password: '',
    });

    /**
     * Zod によるフロントエンドバリデーション
     */
    const validate = (): boolean => {
        clearErrors();
        const result = confirmPasswordSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof ConfirmPasswordFormType, string>> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof ConfirmPasswordFormType;
                if (!fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            });

            Object.entries(fieldErrors).forEach(([path, message]) => {
                setError(path as keyof ConfirmPasswordFormType, message);
            });
            return false;
        }
        return true;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validate()) return;

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AttendanceLayout backgroundColor="#FFFFFF">
            <Head title="パスワードの確認" />

            <div className="mx-auto mt-[60px] max-w-[680px] px-4 sm:px-0">
                <div className="mb-[40px] text-center">
                    <h1 className="text-[36px] font-bold text-black">
                        パスワードの確認
                    </h1>
                </div>

                <div className="mb-6 text-[18px] font-bold text-gray-600">
                    これはアプリケーションの安全なエリアです。
                    <br />
                    続行する前にパスワードを確認してください。
                </div>

                <form onSubmit={submit} noValidate className="space-y-[14px]">
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
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-[60px] w-full rounded-[4px] border border-black p-[10px] text-[20px] font-bold outline-none focus:ring-1 focus:ring-black"
                                autoFocus
                            />
                            {errors.password && (
                                <p className="mt-1 text-[16px] font-bold text-red-600">
                                    {errors.password}
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
                            確認
                        </button>
                    </div>
                </form>
            </div>
        </AttendanceLayout>
    );
}
