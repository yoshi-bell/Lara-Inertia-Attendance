import { z } from 'zod';
import { isTimeAfter, isTimeBeforeOrEqual } from '@/lib/utils';

/**
 * 修正申請フォームのバリデーションスキーマ
 * 一次情報である app/Http/Requests/AttendanceCorrectionRequest.php のルールを完全に同期
 */
export const correctionSchema = z.object({
    requested_start_time: z.string().min(1, '出勤時間を入力してください'),
    requested_end_time: z.string().min(1, '退勤時間を入力してください'),
    reason: z.string().min(1, '備考を記入してください').max(400, '備考は400文字以内で入力してください'),
    rests: z.record(
        z.union([z.string(), z.number()]),
        z.object({
            start_time: z.string().optional(),
            end_time: z.string().optional(),
        })
    ),
}).superRefine((data, ctx) => {
    const { requested_start_time: start, requested_end_time: end } = data;

    // 1. 退勤時刻が出勤時刻より後かチェック
    if (start && end && !isTimeAfter(end, start)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '出勤時間もしくは退勤時間が不適切な値です',
            path: ['requested_end_time'],
        });
    }

    // 2. 休憩時間の整合性チェック
    Object.entries(data.rests).forEach(([id, rest]) => {
        const rStart = rest.start_time;
        const rEnd = rest.end_time;

        // 片方漏れチェック
        if (rStart && !rEnd) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '休憩の終了時間を入力してください',
                path: ['rests', id, 'end_time'],
            });
        }
        if (!rStart && rEnd) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '休憩の開始時間を入力してください',
                path: ['rests', id, 'start_time'],
            });
        }

        // 入力がある場合のみ範囲チェックを実行
        if (rStart && rEnd) {
            // 休憩開始は出勤より後かつ退勤より前であること
            if (isTimeBeforeOrEqual(rStart, start) || !isTimeAfter(end, rStart)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: '休憩時間が不適切な値です',
                    path: ['rests', id, 'start_time'],
                });
            }
            // 休憩終了は開始より後かつ退勤より前であること
            if (!isTimeAfter(rEnd, rStart)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: '休憩の終了時間は、開始時間より後に設定してください',
                    path: ['rests', id, 'end_time'],
                });
            }
            if (isTimeAfter(rEnd, end)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: '休憩時間もしくは退勤時間が不適切な値です',
                    path: ['rests', id, 'end_time'],
                });
            }
        }
    });
});

/**
 * スキーマから型を抽出
 */
export type CorrectionFormType = z.infer<typeof correctionSchema>;
