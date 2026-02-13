import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AttendanceCorrection, Attendance, RestCorrection, Rest } from '@/types/models';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import CorrectionForm from '@/Components/CorrectionForm';
import React from 'react';

/**
 * 管理者用承認画面の Props
 */
interface Props extends PageProps {
    correction: AttendanceCorrection & {
        requester: { name: string };
        attendance: Attendance & { user: { name: string }; rests: Rest[] };
        rest_corrections: RestCorrection[];
    };
}

/**
 * 管理者用修正申請承認画面 (US015)
 */
export default function Approve({ correction, flash }: Props) {
    // 承認処理のための最小限のフォーム機能 (データ保持は不要)
    const { post, processing } = useForm();

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.corrections.approve', correction.id), {
            preserveScroll: true,
        });
    };

    return (
        <AttendanceLayout title="勤怠詳細">
            <Head title="修正申請承認" />

            <div className="mx-auto max-w-[900px]">
                {/* 
                    当日修正制限の案内 
                    基本的には承認待ちリストには当日分は並ばない想定だが、安全策として表示
                */}
                {!correction.attendance.is_editable && correction.status === 'pending' && (
                    <p className="mt-[-40px] mb-8 text-xl font-bold text-[#FF0000] animate-in fade-in duration-500">
                        ※当日の承認は退勤後に行えます
                    </p>
                )}

                {/* 完了通知 */}
                {flash.success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded font-bold text-center animate-in fade-in duration-500">
                        {flash.success}
                    </div>
                )}

                <Card className="border-none bg-transparent shadow-none">
                    <CardContent className="p-0">
                        <div className="bg-white rounded-[8px] overflow-hidden">
                            {/* 
                                共通フォームUI (閲覧モード)
                                data, setData, errors を渡さないことで自動的に閲覧モードとして機能する
                            */}
                            <CorrectionForm
                                attendance={correction.attendance}
                                pendingCorrection={correction}
                            />

                            {/* ボタンエリア */}
                            <div className="mt-10 flex justify-end gap-4 px-4 md:px-[60px] pb-10">
                                {correction.status === 'pending' ? (
                                    <form onSubmit={handleApprove}>
                                        <Button
                                            type="submit"
                                            disabled={processing || !correction.attendance.is_editable}
                                            className="h-12 rounded bg-black text-lg font-bold text-white hover:bg-[#6c757d] disabled:opacity-50"
                                            style={{ width: '130px' }}
                                        >
                                            承認
                                        </Button>
                                    </form>
                                ) : (
                                    <div
                                        className="h-12 flex items-center justify-center rounded bg-[#6c757d] text-lg font-bold text-white shadow-sm"
                                        style={{ width: '130px' }}
                                    >
                                        承認済み
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}