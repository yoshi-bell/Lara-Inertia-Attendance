import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import { PageProps } from '@/types';

interface Props {
    title?: string;
    headerContent?: ReactNode;
}

export default function AttendanceLayout({
    title,
    headerContent,
    children,
}: PropsWithChildren<Props>) {
    // usePage に PageProps 型を明示することで、auth.user が厳格に定義される
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <div className="min-h-screen bg-[#F0EFF2] font-['Inter']">
            {/* ヘッダー */}
            <header className="bg-black py-5 px-5 sm:px-10">
                <div className="mx-auto flex max-w-[1540px] flex-col items-center justify-between gap-4 lg:flex-row">
                    <Link href="/">
                        <img 
                            src="/images/logo.svg" 
                            alt="Atte" 
                            className="h-9 w-auto"
                        />
                    </Link>

                    {user && (
                        <nav>
                            <ul className="flex flex-wrap justify-center gap-7 text-2xl font-bold text-white">
                                <li>
                                    <Link href={route('attendance')} className="hover:opacity-80">
                                        勤怠
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('attendance.list')} className="hover:opacity-80">
                                        勤怠一覧
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('corrections.index')} className="hover:opacity-80">
                                        申請一覧
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button" 
                                        className="font-bold hover:opacity-80"
                                    >
                                        ログアウト
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-0">
                {/* ページタイトル (オプション) */}
                {title && (
                    <div className="mb-12">
                        <h1 className="border-l-[8px] border-black pl-6 text-3xl font-bold text-black">
                            {title}
                        </h1>
                    </div>
                )}

                {/* ヘッダー追加要素 (月次ナビゲーションなど) */}
                {headerContent && (
                    <div className="mb-12">
                        {headerContent}
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
