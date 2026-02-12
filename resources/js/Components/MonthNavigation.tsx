import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MonthPicker from './MonthPicker';

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
    const handleMonthChange = (newMonth: string) => {
        router.get(route(routeName, { ...routeParams, month: newMonth }));
    };

    return (
        <div className="flex h-[60px] items-center justify-between rounded-[10px] bg-white px-3 text-xl font-bold shadow-sm">
            <Link
                href={route(routeName, { ...routeParams, month: prevMonth })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70 transition-opacity"
            >
                <ChevronLeft className="h-5 w-5" /> 前月
            </Link>

            <MonthPicker month={month} onChange={handleMonthChange} />

            <Link
                href={route(routeName, { ...routeParams, month: nextMonth })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70 transition-opacity"
            >
                翌月 <ChevronRight className="h-5 w-5" />
            </Link>
        </div>
    );
}
