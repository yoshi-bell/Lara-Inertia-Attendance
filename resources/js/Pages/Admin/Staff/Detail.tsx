import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { PageProps } from '@/types';
import { User } from '@/types/models';
import AttendanceTable, { CalendarDay } from '@/Components/AttendanceTable';

interface AdminStaffDetailProps extends PageProps {
    staff: User;
    calendarData: CalendarDay[];
    navigation: {
        currentMonth: string;
        prevMonth: string;
        nextMonth: string;
    };
}

export default function Detail({
    staff,
    calendarData,
    navigation,
}: AdminStaffDetailProps) {
    // 2026年02月 -> 2026/02 への変換
    const displayMonth = navigation.currentMonth
        .replace('年', '/')
        .replace('月', '');

    const headerContent = (
        <div className="flex h-[60px] items-center justify-between rounded-[10px] bg-white px-3 text-xl font-bold shadow-sm">
            <Link
                href={route('admin.staff.attendance.show', {
                    user: staff.id,
                    month: navigation.prevMonth,
                })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70"
            >
                <ChevronLeft className="h-5 w-5" /> 前月
            </Link>

            <div className="flex items-center gap-2 text-black">
                <Calendar className="h-6 w-6 text-black" />
                <span className="text-xl font-bold">{displayMonth}</span>
            </div>

            <Link
                href={route('admin.staff.attendance.show', {
                    user: staff.id,
                    month: navigation.nextMonth,
                })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70"
            >
                翌月 <ChevronRight className="h-5 w-5" />
            </Link>
        </div>
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
