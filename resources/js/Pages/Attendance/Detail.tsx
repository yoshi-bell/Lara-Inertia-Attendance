import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AttendanceCorrection, RestCorrection } from '@/types/models';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import CorrectionForm from '@/Components/CorrectionForm';
import { useCorrectionForm } from '@/hooks/useCorrectionForm';
import React from 'react';

/**
 * 勤怠詳細ページ Props (一般ユーザー用)
 */
export type AttendanceDetailProps = PageProps<{
    attendance: App.Data.AttendanceData;
    pendingCorrection: (AttendanceCorrection & {
        rest_corrections: RestCorrection[];
    }) | null;
}>;

/**
 * 勤怠詳細ページ (一般ユーザー用)
 */
export default function Detail({
    attendance,
    pendingCorrection,
}: AttendanceDetailProps) {
    
    // カスタムフックの導入によりロジックを集約
    const { data, setData, handleSubmit, processing, errors } = useCorrectionForm({
        attendance,
        isAdmin: false
    });

    return (
        <AttendanceLayout title="勤怠詳細">
            <Head title="勤怠詳細" />

            <div className="mx-auto max-w-[900px]">
                {/* 
                    当日修正制限の案内 (SSOT: is_editable を参照)
                    承認待ちがない場合にのみ表示する (重複を避けるため)
                */}
                {!attendance.is_editable && !pendingCorrection && (
                    <p className="mt-[-40px] mb-8 text-xl font-bold text-[#FF0000] animate-in fade-in duration-500">
                        ※当日の修正は退勤後に行えます
                    </p>
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
                                        disabled={processing || !attendance.is_editable}
                                        className="h-12 rounded bg-black text-lg font-bold text-white hover:bg-[#6c757d] disabled:opacity-50"
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