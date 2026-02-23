import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { User } from '@/types/models';
import AttendanceTable, { CalendarDay } from '@/Components/domain/AttendanceTable';
import MonthNavigation from '@/Components/domain/MonthNavigation';

type AdminStaffDetailProps = PageProps<{
    staff: User;
    calendarData: CalendarDay[];
    navigation: {
        currentMonth: string;
        prevMonth: string;
        nextMonth: string;
    };
}>;

export default function AttendanceList({
    staff,
    calendarData,
    navigation,
}: AdminStaffDetailProps) {
    const headerContent = (
        <MonthNavigation
            month={navigation.currentMonth}
            prevMonth={navigation.prevMonth}
            nextMonth={navigation.nextMonth}
            routeName="admin.staff.attendance.show"
            routeParams={{ user: staff.id }}
        />
    );

    return (
        <AttendanceLayout
            title={`${staff.name}さんの勤怠`}
            headerContent={headerContent}
        >
            <Head title={`${staff.name}さんの勤怠`} />

            <AttendanceTable
                calendarData={calendarData}
                detailRouteName="admin.attendance.show"
            />

            {/* CSV出力ボタン (旧プロジェクトのデザイン再現) */}
            <div className="mt-[55px] text-right">
                <a
                    href={route('admin.staff.attendance.csv', {
                        user: staff.id,
                        month: navigation.currentMonth
                            .replace('年', '-')
                            .replace('月', ''),
                    })}
                    className="inline-block h-[50px] w-[184px] rounded-[5px] bg-black text-center text-[22px] font-bold leading-[50px] text-white transition-colors hover:bg-[#6c757d]"
                >
                    CSV出力
                </a>
            </div>
        </AttendanceLayout>
    );
}
