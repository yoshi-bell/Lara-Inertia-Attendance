import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Attendance, AttendanceCorrection, Rest } from '@/types/models';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import CorrectionForm from '@/Components/CorrectionForm';
import React from 'react';

interface RestCorrection {
    id: number;
    attendance_correction_id: number;
    rest_id: number | null;
    requested_start_time: string;
    requested_end_time: string | null;
}

export interface AdminAttendanceDetailProps extends PageProps {
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

interface CorrectionFormType {
    requested_start_time: string;
    requested_end_time: string;
    rests: Record<
        string | number,
        {
            start_time: string;
            end_time: string;
        }
    >;
    reason: string;
}

/**
 * 勤怠詳細ページ (管理者用)
 */
export default function Detail({
    attendance,
    pendingCorrection,
}: AdminAttendanceDetailProps) {
    const formatTimeForInput = (dateTimeStr: string | null | undefined) => {
        if (!dateTimeStr) return '';
        if (dateTimeStr.includes('T')) {
            return dateTimeStr.split('T')[1].substring(0, 5);
        }
        return dateTimeStr.substring(0, 5);
    };

    const { data, setData, put, processing, errors } = useForm<CorrectionFormType>(
        {
            requested_start_time: formatTimeForInput(attendance.start_time),
            requested_end_time: formatTimeForInput(attendance.end_time),
            rests: attendance.rests.reduce(
                (acc, rest) => ({
                    ...acc,
                    [rest.id]: {
                        start_time: formatTimeForInput(rest.start_time),
                        end_time: formatTimeForInput(rest.end_time),
                    },
                }),
                {
                    new: { start_time: '', end_time: '' },
                }
            ),
            reason: '',
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 管理者の場合は直接更新 (PUT)
        put(route('admin.attendance.update', attendance.id));
    };

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
                            {/* 共通フォームUI */}
                            <CorrectionForm
                                attendance={attendance}
                                pendingCorrection={pendingCorrection}
                                data={data}
                                setData={setData}
                                errors={errors}
                                formatTimeForInput={formatTimeForInput}
                            />

                            {/* ボタンエリア (管理者用) */}
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
