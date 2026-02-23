import { PropsWithChildren, ReactNode } from 'react';
import Header from '@/Components/domain/Header';

interface Props {
    title?: string;
    headerContent?: ReactNode;
    backgroundColor?: string;
}

/**
 * 勤怠アプリ共通レイアウト (US006〜US015 共通)
 */
export default function AttendanceLayout({
    title,
    headerContent,
    backgroundColor = '#F0EFF2',
    children,
}: PropsWithChildren<Props>) {
    return (
        <div 
            className="min-h-screen font-['Inter']" 
            style={{ backgroundColor }}
        >
            {/* コンポーネント化したヘッダーを配置 */}
            <Header />

            {/* メインコンテンツ */}
            <main className="mx-auto max-w-[900px] px-4 py-12 sm:px-0">
                {/* ページタイトル */}
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