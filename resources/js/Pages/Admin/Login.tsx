import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import Header from '@/Components/Header'; // 追加
import React from 'react';

/**
 * 管理者ログイン画面
 */
export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.login'));
    };

    return (
        <div className="min-h-screen bg-white font-['Inter']">
            <Head title="管理者ログイン" />

            {/* ヘッダーを追加 */}
            <Header />

            <div className="flex flex-col items-center pt-24 px-4">
                <div className="w-full max-w-[680px]">
                    <div className="mb-16 text-center">
                        <h1 className="text-[36px] font-bold text-black">管理者ログイン</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
                        {/* メールアドレス */}
                        <div className="space-y-2">
                            <Label className="text-2xl font-bold text-black">メールアドレス</Label>
                            <div className="h-[116px] space-y-2">
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="h-[60px] border border-black rounded-[4px] px-4 text-lg focus-visible:ring-0"
                                />
                                {errors.email && (
                                    <p className="text-[#dc3545] text-base font-bold ml-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* パスワード */}
                        <div className="space-y-2">
                            <Label className="text-2xl font-bold text-black">パスワード</Label>
                            <div className="h-[116px] space-y-2">
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="h-[60px] border border-black rounded-[4px] px-4 text-lg focus-visible:ring-0"
                                />
                                {errors.password && (
                                    <p className="text-[#dc3545] text-base font-bold ml-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ログインボタン */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-[60px] bg-black hover:bg-gray-800 text-[26px] font-bold text-white rounded-[5px] transition-opacity"
                            >
                                管理者ログインする
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
