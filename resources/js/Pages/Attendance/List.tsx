import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { PageProps } from '@/types';
import AttendanceTable, { CalendarDay } from '@/Components/AttendanceTable';

/**
 * 勤怠一覧ページの Props 定義
 */
export interface AttendanceListProps extends PageProps {
    calendarData: CalendarDay[];
    navigation: {
        currentMonth: string;
        prevMonth: string;
        nextMonth: string;
    };
}

export default function List({
    calendarData,
    navigation,
}: AttendanceListProps) {
    // 2026年02月 -> 2026/02 への変換
    const displayMonth = navigation.currentMonth
        .replace('年', '/')
        .replace('月', '');

    const headerContent = (
        <div className="flex h-[60px] items-center justify-between rounded-[10px] bg-white px-3 text-xl font-bold">
            <Link
                href={route('attendance.list', { month: navigation.prevMonth })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70"
            >
                <ChevronLeft className="h-5 w-5" /> 前月
            </Link>

            <div className="flex items-center gap-2 text-black">
                <Calendar className="h-6 w-6 text-black" />
                <span className="text-xl font-bold">{displayMonth}</span>
            </div>

            <Link
                href={route('attendance.list', { month: navigation.nextMonth })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70"
            >
                翌月 <ChevronRight className="h-5 w-5" />
            </Link>
        </div>
    );

    return (
        <AttendanceLayout title="勤怠一覧" headerContent={headerContent}>
            <Head title="勤怠一覧" />
            <AttendanceTable 
                calendarData={calendarData} 
                detailRouteName="attendance.detail" 
            />
        </AttendanceLayout>
    );
}
