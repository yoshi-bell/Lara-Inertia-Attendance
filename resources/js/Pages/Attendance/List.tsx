import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

interface AttendanceData {
    id: number;
    start_time: string | null;
    end_time: string | null;
    total_rest_time: string;
    work_time: string | null;
}

interface CalendarDay {
    date: string;
    attendance: AttendanceData | null;
}

interface Props {
    calendarData: CalendarDay[];
    navigation: {
        currentMonth: string;
        prevMonth: string;
        nextMonth: string;
    };
}

export default function List({ calendarData, navigation }: Props) {
    // 2026年02月 -> 2026/02 への変換
    const displayMonth = navigation.currentMonth.replace('年', '/').replace('月', '');

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

            <div className="overflow-hidden rounded-[10px] bg-white shadow-sm">
                <Table className="text-center font-bold text-[#737373] tracking-[3px]">
                    <TableHeader className="border-b-[3px] border-[#E1E1E1]">
                        <TableRow className="h-[45px] hover:bg-transparent">
                            <TableHead className="w-[20%] px-10 text-left font-bold text-[#737373]">日付</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">出勤</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">退勤</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">休憩</TableHead>
                            <TableHead className="text-center font-bold text-[#737373]">合計</TableHead>
                            <TableHead className="px-5 text-center font-bold text-[#737373]">詳細</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {calendarData.map((day, index) => (
                            <TableRow 
                                key={index} 
                                className={`h-[45px] border-[#E1E1E1] hover:bg-gray-50 ${
                                    index !== calendarData.length - 1 ? 'border-b-2' : 'border-b-0'
                                }`}
                            >
                                <TableCell className="px-10 text-left">{day.date}</TableCell>
                                <TableCell>{day.attendance?.start_time || ''}</TableCell>
                                <TableCell>{day.attendance?.end_time || ''}</TableCell>
                                <TableCell>{day.attendance ? day.attendance.total_rest_time : ''}</TableCell>
                                <TableCell>{day.attendance?.work_time || ''}</TableCell>
                                <TableCell className="px-5 text-black">
                                    {day.attendance ? (
                                        <Link 
                                            href={route('attendance.detail', day.attendance.id)}
                                            className="hover:underline"
                                        >
                                            詳細
                                        </Link>
                                    ) : (
                                        '詳細'
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AttendanceLayout>
    );
}
