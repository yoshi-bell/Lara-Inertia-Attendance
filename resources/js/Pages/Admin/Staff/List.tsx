import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { User } from '@/types/models';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

type AdminStaffListProps = PageProps<{
    staffs: User[];
}>;

export default function List({ staffs }: AdminStaffListProps) {
    return (
        <AttendanceLayout title="スタッフ一覧">
            <Head title="スタッフ一覧" />

            <div className="overflow-hidden rounded-[10px] bg-white shadow-sm">
                <Table className="text-center font-bold tracking-[3px] text-[#737373]">
                    <TableHeader className="border-b-[3px] border-[#E1E1E1]">
                        <TableRow className="h-[45px] hover:bg-transparent">
                            <TableHead className="w-[35%] pl-[96px] text-left font-bold text-[#737373]">
                                名前
                            </TableHead>
                            <TableHead className="text-left font-bold text-[#737373]">
                                メールアドレス
                            </TableHead>
                            <TableHead className="w-[30%] pr-[30px] text-center font-bold text-[#737373]">
                                月次勤怠
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staffs.length > 0 ? (
                            staffs.map((staff, index) => (
                                <TableRow
                                    key={staff.id}
                                    className={`h-[45px] border-[#E1E1E1] hover:bg-gray-50 ${
                                        index !== staffs.length - 1
                                            ? 'border-b-2'
                                            : 'border-b-0'
                                    }`}
                                >
                                    <TableCell className="pl-[96px] text-left text-black">
                                        {staff.name}
                                    </TableCell>
                                    <TableCell className="text-left font-normal text-[#737373]">
                                        {staff.email}
                                    </TableCell>
                                    <TableCell className="pr-[30px] text-center text-black">
                                        <Link
                                            href={route(
                                                'admin.staff.attendance.show',
                                                staff.id
                                            )}
                                            className="hover:underline"
                                        >
                                            詳細
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="h-32 text-center text-gray-400"
                                >
                                    スタッフが登録されていません。
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AttendanceLayout>
    );
}
