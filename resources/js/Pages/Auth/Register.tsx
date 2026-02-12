import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

/**
 * 会員登録画面 (US001 対応)
 * 旧プロジェクト auth/register.blade.php のデザインを忠実に再現
 */
export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

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
