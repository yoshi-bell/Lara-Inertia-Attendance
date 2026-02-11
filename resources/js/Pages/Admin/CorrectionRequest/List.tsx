import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AttendanceCorrection, Attendance } from '@/types/models';
import CorrectionList from '@/Components/CorrectionList';

interface ListProps extends PageProps {
    corrections: (AttendanceCorrection & {
        attendance: Attendance;
        requester: { name: string };
    })[];
    status: 'pending' | 'approved';
}

/**
 * 管理者用修正申請一覧ページ (US014)
 */
export default function List({ corrections, status }: ListProps) {
    return (
        <AttendanceLayout title="申請一覧">
            <Head title="申請一覧" />

            <CorrectionList
                corrections={corrections}
                status={status}
                isAdmin={true}
            />
        </AttendanceLayout>
    );
}
