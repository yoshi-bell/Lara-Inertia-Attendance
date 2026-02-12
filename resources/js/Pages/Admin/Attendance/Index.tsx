import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageProps } from '@/types';
import { Attendance } from '@/types/models';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import DatePicker from '@/Components/DatePicker';

/**
 * 管理者用勤怠一覧テーブルの1行分のデータ型
 */
type AdminAttendanceListItem = Attendance & {
    user: { name: string };
};

export interface AdminAttendanceIndexProps extends PageProps {
    attendances: AdminAttendanceListItem[];
    navigation: {
        date: string;
        displayDate: string;
        prevDate: string;
        nextDate: string;
        today: string;
    };
}

export default function Index({ attendances, navigation }: AdminAttendanceIndexProps) {
    const handleDateChange = (newDate: string) => {
        router.get(route('admin.attendance.index'), { date: newDate });
    };

    const headerContent = (
        <div className="flex h-[60px] items-center justify-between rounded-[10px] bg-white px-3 text-xl font-bold shadow-sm">
            <Link
                href={route('admin.attendance.index', { date: navigation.prevDate })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70 transition-opacity"
            >
                <ChevronLeft className="h-5 w-5" /> 前日
            </Link>

            <DatePicker 
                date={navigation.date} 
                onChange={handleDateChange} 
            />

            <Link
                href={route('admin.attendance.index', { date: navigation.nextDate })}
                className="flex items-center gap-1 text-base text-[#737373] hover:opacity-70 transition-opacity"
            >
                翌日 <ChevronRight className="h-5 w-5" />
            </Link>
        </div>
    );

    return (
        <AttendanceLayout 
            title={`${navigation.displayDate}の勤怠`} 
            headerContent={headerContent}
        >
            <Head title="勤怠一覧" />

            <div className="overflow-hidden rounded-[10px] bg-white shadow-sm">
                <Table className="text-center font-bold text-[#737373] tracking-[3px]">
                    <TableHeader className="border-b-[3px] border-[#E1E1E1]">
                        <TableRow className="h-[45px] hover:bg-transparent">
                            <TableHead className="px-10 text-left font-bold text-[#737373]">名前</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">出勤</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">退勤</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">休憩</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">合計</TableHead>
                            <TableHead className="px-5 text-center font-bold text-[#737373]">詳細</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendances.length > 0 ? (
                            attendances.map((attendance, index) => (
                                <TableRow 
                                    key={attendance.id} 
                                    className={`h-[45px] border-[#E1E1E1] hover:bg-gray-50 ${
                                        index !== attendances.length - 1 ? 'border-b-2' : 'border-b-0'
                                    }`}
                                >
                                    <TableCell className="px-10 text-left">{attendance.user.name}</TableCell>
                                    <TableCell>{attendance.start_time ? new Date(attendance.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : ''}</TableCell>
                                    <TableCell>{attendance.end_time ? new Date(attendance.end_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : ''}</TableCell>
                                    <TableCell>{attendance.total_rest_time || '0:00'}</TableCell>
                                    <TableCell>{attendance.work_time || ''}</TableCell>
                                    <TableCell className="px-5 text-black">
                                        <Link 
                                            href={route('admin.attendance.show', attendance.id)}
                                            className="hover:underline"
                                        >
                                            詳細
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                    勤怠データがありません。
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AttendanceLayout>
    );
}
