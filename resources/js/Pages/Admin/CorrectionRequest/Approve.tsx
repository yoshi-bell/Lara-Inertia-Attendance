import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AttendanceCorrection, Attendance, RestCorrection } from '@/types/models';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import React from 'react';

/**
 * 管理者用承認画面の Props
 */
interface Props extends PageProps {
    correction: AttendanceCorrection & {
        requester: { name: string };
        attendance: Attendance & { user: { name: string } };
        rest_corrections: RestCorrection[];
    };
}

/**
 * 管理者用修正申請承認画面 (US015)
 * 旧プロジェクトの approve.blade.php の設計を継承
 */
export default function Approve({ correction, flash }: Props) {
    const { post, processing } = useForm();

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.corrections.approve', correction.id), {
            preserveScroll: true,
        });
    };

    const formatTime = (dateTimeStr: string | null) => {
        if (!dateTimeStr) return '';
        const parts = dateTimeStr.split(/[ T]/);
        return parts.length > 1 ? parts[1].substring(0, 5) : '';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    // 共通スタイル定義
    const rowStyle = 'flex items-center border-b-2 border-[#E1E1E1] last:border-0 min-h-[90px] py-4 gap-4';
    const labelWrapperStyle = 'w-64 shrink-0 px-8 md:pl-0';
    const labelTextStyle = 'text-xl font-bold text-[#737373]';
    const contentStyle = 'flex-1 text-xl font-bold text-black pl-8';
    const labelColumnWidth = { width: '256px' };

    return (
        <AttendanceLayout title="修正申請詳細">
            <Head title="修正申請承認" />

            <div className="mx-auto max-w-[900px]">
                {/* 完了通知 */}
                {flash.success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded font-bold text-center">
                        {flash.success}
                    </div>
                )}

                <Card className="border-none bg-transparent shadow-none">
                    <CardContent className="p-0">
                        <div className="bg-white rounded-[8px] overflow-hidden">
                            <div className="px-4 md:px-[60px]">
                                {/* 氏名 */}
                                <div className={`${rowStyle} min-h-[75px]`}>
                                    <div className={labelWrapperStyle} style={labelColumnWidth}>
                                        <div className={labelTextStyle}>氏名</div>
                                    </div>
                                    <div className={contentStyle}>
                                        <p>{correction.requester.name}</p>
                                    </div>
                                </div>

                                {/* 日付 */}
                                <div className={rowStyle}>
                                    <div className={labelWrapperStyle} style={labelColumnWidth}>
                                        <div className={labelTextStyle}>日付</div>
                                    </div>
                                    <div className={contentStyle}>
                                        <p>{formatDate(correction.attendance.work_date)}</p>
                                    </div>
                                </div>

                                {/* 出勤・退勤 (申請内容) */}
                                <div className={rowStyle}>
                                    <div className={labelWrapperStyle} style={labelColumnWidth}>
                                        <div className={labelTextStyle}>出勤・退勤</div>
                                    </div>
                                    <div className={contentStyle}>
                                        <div className="flex items-center">
                                            <span className="w-28 text-center">{formatTime(correction.requested_start_time)}</span>
                                            <span className="mx-4 font-normal text-black text-center w-10">〜</span>
                                            <span className="w-28 text-center">{formatTime(correction.requested_end_time)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 休憩時間 (申請内容) */}
                                {correction.rest_corrections.map((rest, index) => (
                                    <div key={rest.id} className={rowStyle}>
                                        <div className={labelWrapperStyle} style={labelColumnWidth}>
                                            <div className={labelTextStyle}>休憩{index + 1}</div>
                                        </div>
                                        <div className={contentStyle}>
                                            <div className="flex items-center">
                                                <span className="w-28 text-center">{formatTime(rest.requested_start_time)}</span>
                                                <span className="mx-4 font-normal text-black text-center w-10">〜</span>
                                                <span className="w-28 text-center">{formatTime(rest.requested_end_time)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* 備考 */}
                                <div className={`${rowStyle} border-b-0 py-8 items-start`}>
                                    <div className={`${labelWrapperStyle} pt-2`} style={labelColumnWidth}>
                                        <div className={labelTextStyle}>備考</div>
                                    </div>
                                    <div className={contentStyle}>
                                        <p className="text-sm font-bold leading-relaxed text-black">
                                            {correction.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ボタンエリア */}
                            <div className="mt-10 flex justify-end gap-4 px-4 md:px-[60px] pb-10">
                                {correction.status === 'pending' ? (
                                    <form onSubmit={handleApprove}>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 rounded bg-black text-lg font-bold text-white hover:bg-[#6c757d]"
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
