import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AttendanceTable, { CalendarDay } from '@/Components/AttendanceTable';
import MonthNavigation from '@/Components/MonthNavigation';

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
    const headerContent = (
        <MonthNavigation
            month={navigation.currentMonth}
            prevMonth={navigation.prevMonth}
            nextMonth={navigation.nextMonth}
            routeName="attendance.list"
        />
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
