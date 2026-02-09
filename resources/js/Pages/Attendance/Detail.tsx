import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Attendance, AttendanceCorrection, Rest } from '@/types/models';
import { Button } from '@/Components/ui/button';
// Textarea, Input コンポーネントも、標準タグを使う方針になったため削除
// import { Textarea } from '@/Components/ui/textarea';
// import { Input } from '@/Components/ui/input';
// Label コンポーネントも削除
// import { Label } from '@/Components/ui/label';
import { Card, CardContent } from '@/Components/ui/card';
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

interface CorrectionForm {
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

export default function Detail({
    attendance,
    pendingCorrection,
}: AttendanceDetailProps) {
    const formatTimeForInput = (dateTimeStr: string | null | undefined) => {
        if (!dateTimeStr) return '';
        if (dateTimeStr.includes('T')) {
            return dateTimeStr.split('T')[1].substring(0, 5);
        }
        return dateTimeStr.substring(0, 5);
    };

    const { data, setData, post, processing, errors } = useForm<CorrectionForm>(
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
        // post(route('attendances.correction.store', attendance.id));
    };

    const [year, month, day] = attendance.work_date.split('-');

    // 共通スタイル定義
    // w-full を追加して横幅いっぱいに広げる
    const rowStyle =
        'flex items-center border-b-2 border-[#E1E1E1] last:border-0 min-h-[90px] py-4 w-full';
    // 固定幅をより確実に指定 (px指定に変更)
    const labelWrapperStyle = 'w-[256px] min-w-[256px] shrink-0 px-8 md:pl-0';
    // 文字のスタイル
    const labelTextStyle = 'text-xl font-bold text-[#737373]';
    // コンテンツ側のスタイル
    const contentStyle = 'flex-1 text-xl font-bold text-black';
    // 入力欄のスタイル (標準inputタグ用)
    const inputTimeStyle =
        'h-[29px] w-[107px] rounded-[4px] border border-[#ccc] p-0 text-center text-base font-bold tracking-[2px] focus:outline-none focus:border-black';

    // ラベル幅の固定スタイル (JIT回避のため style 属性で指定)
    const labelColumnStyle = { width: '256px' };

    return (
        <AttendanceLayout title="勤怠詳細">
            <Head title="勤怠詳細" />

            <div className="mx-auto max-w-[900px]">
                <Card className="border-none bg-transparent shadow-none">
                    <CardContent className="p-0">
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-hidden rounded-[8px] bg-white"
                        >
                            <div className="px-4 md:px-[60px]">
                                {/* 氏名 */}
                                <div className={`${rowStyle} min-h-[75px]`}>
                                    <div
                                        className={labelWrapperStyle}
                                        style={labelColumnStyle}
                                    >
                                        <div className={labelTextStyle}>
                                            氏名
                                        </div>
                                    </div>
                                    <div className={contentStyle}>
                                        <p>{attendance.user.name}</p>
                                    </div>
                                </div>

                                {/* 日付 */}
                                <div className={rowStyle}>
                                    <div
                                        className={labelWrapperStyle}
                                        style={labelColumnStyle}
                                    >
                                        <div className={labelTextStyle}>
                                            日付
                                        </div>
                                    </div>
                                    <div className={contentStyle}>
                                        <div className="flex flex-wrap gap-10 tracking-widest md:gap-20">
                                            <span className="w-24 text-center md:w-32">
                                                {year}年
                                            </span>
                                            <span className="w-24 text-center md:w-32">
                                                {parseInt(month)}月
                                                {parseInt(day)}日
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 出勤・退勤 */}
                                <div className={rowStyle}>
                                    <div
                                        className={labelWrapperStyle}
                                        style={labelColumnStyle}
                                    >
                                        <div className={labelTextStyle}>
                                            出勤・退勤
                                        </div>
                                    </div>
                                    <div className={contentStyle}>
                                        <div className="flex flex-wrap items-center gap-4 md:gap-10">
                                            {pendingCorrection ? (
                                                <>
                                                    <span className="w-28 text-center">
                                                        {formatTimeForInput(
                                                            pendingCorrection.requested_start_time
                                                        )}
                                                    </span>
                                                    <span className="mx-4 font-normal text-gray-400">
                                                        〜
                                                    </span>
                                                    <span className="w-28 text-center">
                                                        {formatTimeForInput(
                                                            pendingCorrection.requested_end_time
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={
                                                            data.requested_start_time
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'requested_start_time',
                                                                e.target.value
                                                            )
                                                        }
                                                        className={
                                                            inputTimeStyle
                                                        }
                                                    />
                                                    <span className="mx-4 font-normal text-black">
                                                        〜
                                                    </span>
                                                    <input
                                                        type="time"
                                                        value={
                                                            data.requested_end_time
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'requested_end_time',
                                                                e.target.value
                                                            )
                                                        }
                                                        className={
                                                            inputTimeStyle
                                                        }
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 休憩 */}
                                {attendance.rests.map((rest, index) => (
                                    <div key={rest.id} className={rowStyle}>
                                        <div
                                            className={labelWrapperStyle}
                                            style={labelColumnStyle}
                                        >
                                            <div className={labelTextStyle}>
                                                休憩{index + 1}
                                            </div>
                                        </div>
                                        <div className={contentStyle}>
                                            <div className="flex flex-wrap items-center gap-4 md:gap-10">
                                                {pendingCorrection ? (
                                                    <>
                                                        <span className="w-28 text-center">
                                                            {formatTimeForInput(
                                                                pendingCorrection.rest_corrections.find(
                                                                    (rc) =>
                                                                        rc.rest_id ===
                                                                        rest.id
                                                                )
                                                                    ?.requested_start_time
                                                            )}
                                                        </span>
                                                        <span className="mx-4 font-normal text-gray-400">
                                                            〜
                                                        </span>
                                                        <span className="w-28 text-center">
                                                            {formatTimeForInput(
                                                                pendingCorrection.rest_corrections.find(
                                                                    (rc) =>
                                                                        rc.rest_id ===
                                                                        rest.id
                                                                )
                                                                    ?.requested_end_time
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <input
                                                            type="time"
                                                            value={
                                                                data.rests[
                                                                    rest.id
                                                                ].start_time
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'rests',
                                                                    {
                                                                        ...data.rests,
                                                                        [rest.id]:
                                                                            {
                                                                                ...data
                                                                                    .rests[
                                                                                    rest
                                                                                        .id
                                                                                ],
                                                                                start_time:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                    }
                                                                )
                                                            }
                                                            className={
                                                                inputTimeStyle
                                                            }
                                                        />
                                                        <span className="mx-4 font-normal text-black">
                                                            〜
                                                        </span>
                                                        <input
                                                            type="time"
                                                            value={
                                                                data.rests[
                                                                    rest.id
                                                                ].end_time
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'rests',
                                                                    {
                                                                        ...data.rests,
                                                                        [rest.id]:
                                                                            {
                                                                                ...data
                                                                                    .rests[
                                                                                    rest
                                                                                        .id
                                                                                ],
                                                                                end_time:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                    }
                                                                )
                                                            }
                                                            className={
                                                                inputTimeStyle
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {!pendingCorrection && (
                                    <div className={rowStyle}>
                                        <div
                                            className={labelWrapperStyle}
                                            style={labelColumnStyle}
                                        >
                                            <div className={labelTextStyle}>
                                                休憩
                                                {attendance.rests.length + 1}
                                            </div>
                                        </div>
                                        <div className={contentStyle}>
                                            <div className="flex flex-wrap items-center gap-4 md:gap-10">
                                                <input
                                                    type="time"
                                                    value={
                                                        data.rests.new
                                                            .start_time
                                                    }
                                                    onChange={(e) =>
                                                        setData('rests', {
                                                            ...data.rests,
                                                            new: {
                                                                ...data.rests
                                                                    .new,
                                                                start_time:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        })
                                                    }
                                                    className={inputTimeStyle}
                                                />
                                                <span className="mx-4 font-normal text-black">
                                                    〜
                                                </span>
                                                <input
                                                    type="time"
                                                    value={
                                                        data.rests.new.end_time
                                                    }
                                                    onChange={(e) =>
                                                        setData('rests', {
                                                            ...data.rests,
                                                            new: {
                                                                ...data.rests
                                                                    .new,
                                                                end_time:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        })
                                                    }
                                                    className={inputTimeStyle}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 備考 */}
                                <div
                                    className={`${rowStyle} items-start border-b-0 py-8`}
                                >
                                    <div
                                        className={`${labelWrapperStyle} pt-2`}
                                        style={labelColumnStyle}
                                    >
                                        <div className={labelTextStyle}>
                                            備考
                                        </div>
                                    </div>
                                    <div className={contentStyle}>
                                        {pendingCorrection ? (
                                            <p className="text-sm font-bold leading-relaxed text-black">
                                                {pendingCorrection.reason}
                                            </p>
                                        ) : (
                                            <div>
                                                <textarea
                                                    value={data.reason}
                                                    onChange={(e) =>
                                                        setData(
                                                            'reason',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-[72px] w-full max-w-[330px] rounded-[4px] border border-[#ccc] p-2 text-sm font-bold focus:border-black focus:outline-none"
                                                />
                                                {errors.reason && (
                                                    <p className="mt-2 text-sm font-bold text-[#FF0000]">
                                                        {errors.reason}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ボタンエリア */}
                            <div
                                className="mt-10 flex justify-end gap-4 px-4 pb-20 md:px-[60px]"
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

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                input[type="time"]::-webkit-calendar-picker-indicator {
                    display: none;
                }
            `,
                }}
            />
        </AttendanceLayout>
    );
}
