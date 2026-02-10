import { Link } from '@inertiajs/react';
import { User } from '@/types';

interface Props {
    user: User;
}

/**
 * ナビゲーションメニューコンポーネント (US003, US005, US012 等に対応)
 */
export default function Navigation({ user }: Props) {
    // 共通のリンクスタイル
    const linkStyle = "hover:opacity-80 transition-opacity";

    return (
        <nav>
            <ul className="flex flex-wrap justify-center gap-7 text-2xl font-bold text-white">
                {user.is_admin ? (
                    /* 管理者用メニュー */
                    <>
                        <li>
                            <Link href={route('admin.attendance.index')} className={linkStyle}>
                                勤怠一覧
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className={linkStyle}>
                                スタッフ一覧
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className={linkStyle}>
                                申請一覧
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href={route('admin.logout')} 
                                method="post" 
                                as="button" 
                                className={`font-bold ${linkStyle}`}
                            >
                                ログアウト
                            </Link>
                        </li>
                    </>
                ) : (
                    /* 一般ユーザー用メニュー */
                    <>
                        <li>
                            <Link href={route('attendance')} className={linkStyle}>
                                勤怠
                            </Link>
                        </li>
                        <li>
                            <Link href={route('attendance.list')} className={linkStyle}>
                                勤怠一覧
                            </Link>
                        </li>
                        <li>
                            <Link href={route('corrections.index')} className={linkStyle}>
                                申請一覧
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href={route('logout')} 
                                method="post" 
                                as="button" 
                                className={`font-bold ${linkStyle}`}
                            >
                                ログアウト
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
