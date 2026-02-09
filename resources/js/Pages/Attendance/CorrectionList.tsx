import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AttendanceCorrection, Attendance } from '@/types/models';
import CorrectionList from '@/Components/CorrectionList';

interface Props extends PageProps {
    corrections: (AttendanceCorrection & {
        attendance: Attendance;
    })[];
    status: 'pending' | 'approved';
}

export default function CorrectionListPage({ corrections, status, auth }: Props) {
    return (
        <AttendanceLayout title="申請一覧">
            <Head title="申請一覧" />

            <CorrectionList
                corrections={corrections}
                status={status}
                isAdmin={false}
                currentUserName={auth.user.name}
            />
        </AttendanceLayout>
    );
}
