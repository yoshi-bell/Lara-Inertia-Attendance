import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthNavigationProps {
    month: string;
    prevMonth: string;
    nextMonth: string;
    routeName: string;
    routeParams?: Record<string, string | number | undefined>;
}

/**
 * 月次ナビゲーション共通コンポーネント (US007, US013 共通)
 */
export default function MonthNavigation({
    month,
    prevMonth,
    nextMonth,
    routeName,
    routeParams = {},
}: MonthNavigationProps) {
    // 表示用の月フォーマット変換 (2026年02月 -> 2026/02)
    const displayMonth = month.replace('年', '/').replace('月', '');

    return (
        <div className="flex h-[60px] items-center justify-between rounded-[10px] bg-white px-3 text-xl font-bold shadow-sm">
            <Link
                href={route(routeName, { ...routeParams, month: prevMonth })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70 transition-opacity"
            >
                <ChevronLeft className="h-5 w-5" /> 前月
            </Link>

            <div className="flex items-center gap-2 text-black">
                <Calendar className="h-6 w-6 text-black" />
                <span className="text-xl font-bold">{displayMonth}</span>
            </div>

            <Link
                href={route(routeName, { ...routeParams, month: nextMonth })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70 transition-opacity"
            >
                翌月 <ChevronRight className="h-5 w-5" />
            </Link>
        </div>
    );
}
