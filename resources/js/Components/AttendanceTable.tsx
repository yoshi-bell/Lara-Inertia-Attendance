import { Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Attendance } from '@/types/models';

/**
 * 勤怠一覧テーブルの1行分のデータ型
 */
type AttendanceListItem = Pick<
    Attendance,
    'id' | 'start_time_hi' | 'end_time_hi' | 'total_rest_time' | 'work_time'
>;

export interface CalendarDay {
    date: string;
    attendance: AttendanceListItem | null;
}

export interface AttendanceTableProps {
    calendarData: CalendarDay[];
    detailRouteName: string; // 'attendance.detail' または 'admin.attendance.show'
}

/**
 * 勤怠一覧を表示する共通テーブルコンポーネント
 */
export default function AttendanceTable({
    calendarData,
    detailRouteName,
}: AttendanceTableProps) {
    return (
        <div className="overflow-hidden rounded-[10px] bg-white shadow-sm">
            <Table className="text-center font-bold tracking-[3px] text-[#737373]">
                <TableHeader className="border-b-[3px] border-[#E1E1E1]">
                    <TableRow className="h-[45px] hover:bg-transparent">
                        <TableHead className="w-[20%] px-10 text-left font-bold text-[#737373]">
                            日付
                        </TableHead>
                        <TableHead className="text-center font-bold text-[#737373]">
                            出勤
                        </TableHead>
                        <TableHead className="text-center font-bold text-[#737373]">
                            退勤
                        </TableHead>
                        <TableHead className="text-center font-bold text-[#737373]">
                            休憩
                        </TableHead>
                        <TableHead className="text-center font-bold text-[#737373]">
                            合計
                        </TableHead>
                        <TableHead className="px-5 text-center font-bold text-[#737373]">
                            詳細
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {calendarData.map((day, index) => (
                        <TableRow
                            key={index}
                            className={`h-[45px] border-[#E1E1E1] hover:bg-gray-50 ${
                                index !== calendarData.length - 1
                                    ? 'border-b-2'
                                    : 'border-b-0'
                            }`}
                        >
                            <TableCell className="px-10 text-left">
                                {day.date}
                            </TableCell>
                            <TableCell>
                                {day.attendance?.start_time_hi || ''}
                            </TableCell>
                            <TableCell>
                                {day.attendance?.end_time_hi || ''}
                            </TableCell>
                            <TableCell>
                                {day.attendance
                                    ? day.attendance.total_rest_time
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {day.attendance?.work_time || ''}
                            </TableCell>
                            <TableCell className="px-5 text-black">
                                {day.attendance ? (
                                    <Link
                                        href={route(
                                            detailRouteName,
                                            day.attendance.id
                                        )}
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
    );
}
