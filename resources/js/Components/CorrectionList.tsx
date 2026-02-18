import { Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { AttendanceCorrection, Attendance } from '@/types/models';
import { CORRECTION_STATUS, CorrectionStatus } from '@/constants';

/**
 * 修正申請リストの共通コンポーネント Props
 */
export interface CorrectionListProps {
    corrections: (AttendanceCorrection & {
        attendance: Attendance;
        // 管理者表示の際は申請者の名前が必要
        requester?: { name: string };
    })[];
    status: CorrectionStatus;
    isAdmin?: boolean;
    currentUserName?: string;
}

export default function CorrectionList({
    corrections,
    status,
    isAdmin = false,
    currentUserName,
}: CorrectionListProps) {
    // タブ切り替えのベースパスを設計書通りに指定
    const basePath = isAdmin ? '/admin/stamp_correction_request/list' : '/stamp_correction_request/list';

    const formatDay = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-8">
            {/* タブメニュー */}
            <div className="flex border-b-2 border-gray-200">
                <Link
                    href={`${basePath}?status=${CORRECTION_STATUS.PENDING}`}
                    className={`px-8 py-2 text-xl font-bold transition-colors ${
                        status === CORRECTION_STATUS.PENDING
                            ? 'border-b-4 border-black text-black'
                            : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    承認待ち
                </Link>
                <Link
                    href={`${basePath}?status=${CORRECTION_STATUS.APPROVED}`}
                    className={`px-8 py-2 text-xl font-bold transition-colors ${
                        status === CORRECTION_STATUS.APPROVED
                            ? 'border-b-4 border-black text-black'
                            : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    承認済み
                </Link>
            </div>

            {/* 申請一覧テーブル */}
            <div className="overflow-hidden rounded-[10px] bg-white shadow-sm">
                <Table className="text-center font-bold text-[#737373] tracking-normal">
                    <TableHeader className="border-b-[3px] border-[#E1E1E1]">
                        <TableRow className="h-[45px] hover:bg-transparent">
                            <TableHead className="px-6 text-center font-bold text-[#737373]">状態</TableHead>
                            <TableHead className="px-6 text-center font-bold text-[#737373]">名前</TableHead>
                            <TableHead className="px-6 text-center font-bold text-[#737373]">対象日時</TableHead>
                            <TableHead className="px-6 text-center font-bold text-[#737373]">申請理由</TableHead>
                            <TableHead className="px-6 text-center font-bold text-[#737373]">申請日時</TableHead>
                            <TableHead className="px-6 text-center font-bold text-[#737373]">詳細</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {corrections.length > 0 ? (
                            corrections.map((correction) => (
                                <TableRow key={correction.id} className="h-[60px] border-b-2 border-[#E1E1E1] hover:bg-gray-50">
                                    <TableCell className="px-6">
                                        {correction.status === CORRECTION_STATUS.PENDING ? '承認待ち' : '承認済み'}
                                    </TableCell>
                                    <TableCell className="px-6">
                                        {isAdmin ? correction.requester?.name : currentUserName}
                                    </TableCell>
                                    <TableCell className="px-6">
                                        {formatDay(correction.attendance.work_date)}
                                    </TableCell>
                                    <TableCell className="px-6 max-w-[200px] truncate">
                                        {correction.reason}
                                    </TableCell>
                                    <TableCell className="px-6">
                                        {formatDay(correction.created_at)}
                                    </TableCell>
                                    <TableCell className="px-6 text-black">
                                        <Link
                                            href={
                                                isAdmin
                                                    ? route('admin.corrections.approve.show', correction.id)
                                                    : route('attendance.detail', correction.attendance_id)
                                            }
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
                                    該当する申請はありません。
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
