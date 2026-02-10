import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Attendance, AttendanceCorrection, Rest } from '@/types/models';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import CorrectionForm from '@/Components/CorrectionForm';
import React, { useEffect } from 'react';

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
    flash,
}: AdminAttendanceDetailProps) {
    const formatTimeForInput = (dateTimeStr: string | null | undefined) => {
        if (!dateTimeStr) return '';
        if (dateTimeStr.includes('T')) {
            return dateTimeStr.split('T')[1].substring(0, 5);
        }
        return dateTimeStr.substring(0, 5);
    };

    // 初期値を生成する関数
    const getInitialValues = (att: typeof attendance) => ({
        requested_start_time: formatTimeForInput(att.start_time),
        requested_end_time: formatTimeForInput(att.end_time),
        rests: att.rests.reduce(
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
    });

    const { data, setData, put, processing, errors, reset } = useForm<CorrectionFormType>(
        getInitialValues(attendance)
    );

    /**
     * 【重要】モダンなデータ同期ロジック
     * サーバー側のデータ（attendance）が更新されたら、フォームのステートを最新化する
     */
    useEffect(() => {
        // updated_at が変わった＝サーバーで更新されたと判断
        reset();
        // フォーム内のデータも最新の attendance に基づいて再セット
        const freshValues = getInitialValues(attendance);
        setData(freshValues);
    }, [attendance.updated_at]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ページ遷移せず、その場で更新を反映させるために preserveScroll を指定
        put(route('admin.attendance.update', attendance.id), {
            preserveScroll: true,
        });
    };

    return (
        <AttendanceLayout title="勤怠詳細">
            <Head title="勤怠詳細" />

            <div className="mx-auto max-w-[900px]">
                {/* 完了通知メッセージ */}
                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded font-bold text-center animate-in fade-in duration-500">
                        {flash.success}
                    </div>
                )}

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