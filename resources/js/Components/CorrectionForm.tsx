import { Attendance, AttendanceCorrection, Rest, RestCorrection } from '@/types/models';
import { CorrectionFormType } from '@/hooks/useCorrectionForm';
import React from 'react';

/**
 * 共通フォームコンポーネントの Props
 * data, setData, errors をオプショナルにし、閲覧専用モードにも対応
 */
interface CorrectionFormProps {
    attendance: Attendance & {
        user: { name: string };
        rests: Rest[];
    };
    pendingCorrection?: (AttendanceCorrection & {
        rest_corrections: RestCorrection[];
    }) | null;
    data?: CorrectionFormType;
    setData?: {
        (data: CorrectionFormType): void;
        <K extends keyof CorrectionFormType>(key: K, value: CorrectionFormType[K]): void;
        (callback: (data: CorrectionFormType) => CorrectionFormType): void;
    };
    errors?: Partial<Record<string, string>>;
}

/**
 * 勤怠修正フォームの共通UIパーツ
 */
export default function CorrectionForm({
    attendance,
    pendingCorrection,
    data,
    setData,
    errors = {},
}: CorrectionFormProps) {
    const [year, month, day] = attendance.work_date.split('-');

    // 共通スタイル定義
    const rowStyle = 'flex items-center border-b-2 border-[#E1E1E1] last:border-0 min-h-[90px] py-4 w-full';
    const labelWrapperStyle = 'w-[256px] min-w-[256px] shrink-0 px-8 md:pl-0';
    const labelTextStyle = 'text-xl font-bold text-[#737373]';
    const contentStyle = 'flex-1 text-xl font-bold text-black pl-8';
    const inputTimeStyle = 'h-[29px] w-[107px] rounded-[4px] border border-[#ccc] p-0 text-center text-base font-bold tracking-[2px] focus:outline-none focus:border-black cursor-pointer';
    const labelColumnWidth = { width: '256px' };

    // 編集可能かどうかの判定 (data と setData があり、かつ承認待ちでない場合)
    const isEditable = !!(data && setData && !pendingCorrection);

    return (
        <div className="px-4 md:px-[60px]">
            {/* 氏名 */}
            <div className={`${rowStyle} min-h-[75px]`}>
                <div className={labelWrapperStyle} style={labelColumnWidth}>
                    <div className={labelTextStyle}>氏名</div>
                </div>
                <div className={contentStyle}>
                    <p>{attendance.user.name}</p>
                </div>
            </div>

            {/* 日付 */}
            <div className={rowStyle}>
                <div className={labelWrapperStyle} style={labelColumnWidth}>
                    <div className={labelTextStyle}>日付</div>
                </div>
                <div className={contentStyle}>
                    <div className="flex flex-wrap gap-10 tracking-widest md:gap-20">
                        <span className="w-24 text-center md:w-32">{year}年</span>
                        <span className="w-24 text-center md:w-32">{parseInt(month)}月{parseInt(day)}日</span>
                    </div>
                </div>
            </div>

            {/* 出勤・退勤 */}
            <div className={rowStyle}>
                <div className={labelWrapperStyle} style={labelColumnWidth}>
                    <div className={labelTextStyle}>出勤・退勤</div>
                </div>
                <div className={contentStyle}>
                    <div className="flex flex-wrap items-center gap-4 md:gap-10">
                        {!isEditable ? (
                            <>
                                <span className="w-28 text-center">
                                    {pendingCorrection?.requested_start_time_hi || attendance.start_time_hi}
                                </span>
                                <span className="mx-4 font-normal text-gray-400">〜</span>
                                <span className="w-28 text-center">
                                    {pendingCorrection?.requested_end_time_hi || attendance.end_time_hi}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col">
                                    <input
                                        type="time"
                                        value={data?.requested_start_time}
                                        onChange={(e) => setData!('requested_start_time', e.target.value)}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                        className={inputTimeStyle}
                                    />
                                    {errors.requested_start_time && (
                                        <p className="mt-1 text-xs font-bold text-[#FF0000]">{errors.requested_start_time}</p>
                                    )}
                                </div>
                                <span className="mx-4 font-normal text-black">〜</span>
                                <div className="flex flex-col">
                                    <input
                                        type="time"
                                        value={data?.requested_end_time}
                                        onChange={(e) => setData!('requested_end_time', e.target.value)}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                        className={inputTimeStyle}
                                    />
                                    {errors.requested_end_time && (
                                        <p className="mt-1 text-xs font-bold text-[#FF0000]">{errors.requested_end_time}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 休憩 */}
            {attendance.rests.map((rest, index) => (
                <div key={rest.id} className={rowStyle}>
                    <div className={labelWrapperStyle} style={labelColumnWidth}>
                        <div className={labelTextStyle}>休憩{index + 1}</div>
                    </div>
                    <div className={contentStyle}>
                        <div className="flex flex-wrap items-center gap-4 md:gap-10">
                            {!isEditable ? (
                                <>
                                    <span className="w-28 text-center">
                                        {pendingCorrection?.rest_corrections?.find(rc => rc.rest_id === rest.id)?.requested_start_time_hi || rest.start_time_hi}
                                    </span>
                                    <span className="mx-4 font-normal text-gray-400">〜</span>
                                    <span className="w-28 text-center">
                                        {pendingCorrection?.rest_corrections?.find(rc => rc.rest_id === rest.id)?.requested_end_time_hi || rest.end_time_hi}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <input
                                            type="time"
                                            value={data?.rests[rest.id]?.start_time || ''}
                                            onChange={(e) => setData!('rests', {
                                                ...data!.rests,
                                                [rest.id]: { ...data!.rests[rest.id], start_time: e.target.value }
                                            })}
                                            onKeyDown={(e) => e.preventDefault()}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                            className={inputTimeStyle}
                                        />
                                        {errors[`rests.${rest.id}.start_time`] && (
                                            <p className="mt-1 text-xs font-bold text-[#FF0000]">{errors[`rests.${rest.id}.start_time`]}</p>
                                        )}
                                    </div>
                                    <span className="mx-4 font-normal text-black">〜</span>
                                    <div className="flex flex-col">
                                        <input
                                            type="time"
                                            value={data?.rests[rest.id]?.end_time || ''}
                                            onChange={(e) => setData!('rests', {
                                                ...data!.rests,
                                                [rest.id]: { ...data!.rests[rest.id], end_time: e.target.value }
                                            })}
                                            onKeyDown={(e) => e.preventDefault()}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                            className={inputTimeStyle}
                                        />
                                        {errors[`rests.${rest.id}.end_time`] && (
                                            <p className="mt-1 text-xs font-bold text-[#FF0000]">{errors[`rests.${rest.id}.end_time`]}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* 新規休憩追加 (編集モード時のみ表示) */}
            {isEditable && data && (
                <div className={rowStyle}>
                    <div className={labelWrapperStyle} style={labelColumnWidth}>
                        <div className={labelTextStyle}>休憩{attendance.rests.length + 1}</div>
                    </div>
                    <div className={contentStyle}>
                        <div className="flex flex-wrap items-center gap-4 md:gap-10">
                            <div className="flex flex-col">
                                <input
                                    type="time"
                                    value={data.rests.new.start_time}
                                    onChange={(e) => setData!('rests', {
                                        ...data.rests,
                                        new: { ...data.rests.new, start_time: e.target.value }
                                    })}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    className={inputTimeStyle}
                                />
                                {errors['rests.new.start_time'] && (
                                    <p className="mt-1 text-xs font-bold text-[#FF0000]">{errors['rests.new.start_time']}</p>
                                )}
                            </div>
                            <span className="mx-4 font-normal text-black">〜</span>
                            <div className="flex flex-col">
                                <input
                                    type="time"
                                    value={data.rests.new.end_time}
                                    onChange={(e) => setData!('rests', {
                                        ...data.rests,
                                        new: { ...data.rests.new, end_time: e.target.value }
                                    })}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    className={inputTimeStyle}
                                />
                                {errors['rests.new.end_time'] && (
                                    <p className="mt-1 text-xs font-bold text-[#FF0000]">{errors['rests.new.end_time']}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 備考 */}
            <div className={`${rowStyle} items-start border-b-0 py-8`}>
                <div className={`${labelWrapperStyle} pt-2`} style={labelColumnWidth}>
                    <div className={labelTextStyle}>備考</div>
                </div>
                <div className={contentStyle}>
                    {!isEditable ? (
                        <p className="text-sm font-bold leading-relaxed text-black">
                            {pendingCorrection?.reason || ''}
                        </p>
                    ) : (
                        <div>
                            <textarea
                                value={data?.reason}
                                onChange={(e) => setData!('reason', e.target.value)}
                                className="h-[72px] w-full max-w-[330px] rounded-[4px] border border-[#ccc] p-2 text-sm font-bold focus:border-black focus:outline-none"
                            />
                            {errors.reason && (
                                <p className="mt-2 text-sm font-bold text-[#FF0000]">{errors.reason}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}