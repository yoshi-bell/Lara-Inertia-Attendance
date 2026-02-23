import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import Navigation from './Navigation';

/**
 * 共通ヘッダーコンポーネント
 */
export default function Header() {
    // ログインユーザー情報を取得
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <header className="bg-black py-5 px-5 sm:px-10">
            <div className="mx-auto flex max-w-[1540px] flex-col items-center justify-between gap-4 lg:flex-row">
                <Link href="/">
                    <img 
                        src="/images/logo.svg" 
                        alt="Atte" 
                        className="h-9 w-auto"
                    />
                </Link>

                {/* ログインしている場合のみナビゲーションを表示 */}
                {user && <Navigation user={user} />}
            </div>
        </header>
    );
}
