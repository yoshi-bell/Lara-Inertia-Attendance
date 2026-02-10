import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Attendance, AttendanceCorrection, Rest } from '@/types/models';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import CorrectionForm from '@/Components/CorrectionForm';
import { useCorrectionForm } from '@/hooks/useCorrectionForm';
import React from 'react';

interface RestCorrection {
    id: number;
    attendance_correction_id: number;
    rest_id: number | null;
    requested_start_time: string;
    requested_end_time: string | null;
}

export interface AttendanceDetailProps extends PageProps {
    attendance: Attendance & {
        user: { name: string };
        rests: Rest[];
    };
    pendingCorrection:
        | (AttendanceCorrection & {
              rest_corrections: RestCorrection[];
          })
        | null;
}

/**
 * 勤怠詳細ページ (一般ユーザー用)
 */
export default function Detail({
    attendance,
    pendingCorrection,
}: AttendanceDetailProps) {
    
    // カスタムフックの導入によりロジックを集約
    const { data, setData, handleSubmit, processing, errors, formatTimeForInput } = useCorrectionForm({
        attendance,
        isAdmin: false
    });

    return (
        <AttendanceLayout title="勤怠詳細">
            <Head title="勤怠詳細" />

            <div className="mx-auto max-w-[900px]">
                <Card className="border-none bg-transparent shadow-none">
                    <CardContent className="p-0">
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-hidden rounded-[8px] bg-white"
                            noValidate
                        >
                            <CorrectionForm
                                attendance={attendance}
                                pendingCorrection={pendingCorrection}
                                data={data}
                                setData={setData}
                                errors={errors}
                                formatTimeForInput={formatTimeForInput}
                            />

                            <div
                                className="mt-10 flex justify-end gap-4 px-4 pb-10 md:px-[60px]"
                                style={{ paddingBottom: '20px' }}
                            >
                                {pendingCorrection ? (
                                    <p className="text-lg font-bold text-[#FF0000] opacity-50">
                                        *承認待ちの申請があるため修正はできません
                                    </p>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-12 rounded bg-black text-lg font-bold text-white hover:bg-[#6c757d]"
                                        style={{ width: '130px' }}
                                    >
                                        修正
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
