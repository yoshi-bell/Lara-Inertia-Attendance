import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Attendance, AttendanceCorrection, Rest, RestCorrection } from '@/types/models';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import CorrectionForm from '@/Components/CorrectionForm';
import { useCorrectionForm } from '@/hooks/useCorrectionForm';
import React from 'react';

/**
 * 勤怠詳細ページ Props (管理者用)
 * 全てのモデル定義を @/types/models からインポートし、一本化
 */
export interface AdminAttendanceDetailProps extends PageProps {
    attendance: Attendance & {
        user: { name: string };
        rests: Rest[];
    };
    pendingCorrection: (AttendanceCorrection & {
        rest_corrections: RestCorrection[];
    }) | null;
}

/**
 * 勤怠詳細ページ (管理者用)
 */
export default function Detail({
    attendance,
    pendingCorrection,
    flash,
}: AdminAttendanceDetailProps) {
    
    // カスタムフックの導入 (isAdmin: true を指定)
    const { data, setData, handleSubmit, processing, errors } = useCorrectionForm({
        attendance,
        isAdmin: true
    });

    return (
        <AttendanceLayout title="勤怠詳細">
            <Head title="勤怠詳細" />

            <div className="mx-auto max-w-[900px]">
                {/* 当日修正制限の案内 (管理者も同様のルールを適用) */}
                {!attendance.is_editable && !pendingCorrection && (
                    <p className="mt-[-40px] mb-8 text-xl font-bold text-[#FF0000] animate-in fade-in duration-500">
                        ※当日の修正は退勤後に行えます
                    </p>
                )}

                {/* 完了通知メッセージ (管理者用のみ表示) */}
                {flash.success && (
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
                            {/* 共通フォームUI */}
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