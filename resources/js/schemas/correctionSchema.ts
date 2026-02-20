import { z } from 'zod';
import { isTimeAfter, isTimeBeforeOrEqual, formatMessage } from '@/lib/utils';
import messages from '@/constants/validation_messages.json';

/**
 * 修正申請フォームのバリデーションスキーマ
 * 一次情報である validation_messages.json と同期
 */
export const correctionSchema = z
    .object({
        requested_start_time: z.string().min(1, messages.ATTENDANCE_START_REQUIRED),
        requested_end_time: z.string().min(1, messages.ATTENDANCE_END_REQUIRED),
        reason: z
            .string()
            .min(1, messages.CORRECTION_REASON_REQUIRED)
            .max(400, formatMessage(messages.CORRECTION_REASON_MAX, { max: 400 })),
        rests: z.record(
            z.union([z.string(), z.number()]),
            z.object({
                start_time: z.string().optional(),
                end_time: z.string().optional(),
            })
        ),
    })
    .superRefine((data, ctx) => {
        const { requested_start_time: start, requested_end_time: end } = data;

        // 1. 退勤時刻が出勤時刻より後かチェック
        if (start && end && !isTimeAfter(end, start)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: messages.INVALID_ATTENDANCE_TIME,
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
                    message: messages.REST_END_REQUIRED,
                    path: ['rests', id, 'end_time'],
                });
            }
            if (!rStart && rEnd) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: messages.REST_START_REQUIRED,
                    path: ['rests', id, 'start_time'],
                });
            }

            // 入力がある場合のみ範囲チェックを実行
            if (rStart && rEnd) {
                // 休憩開始は出勤より後かつ退勤より前であること
                if (
                    isTimeBeforeOrEqual(rStart, start) ||
                    !isTimeAfter(end, rStart)
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: messages.INVALID_REST_TIME,
                        path: ['rests', id, 'start_time'],
                    });
                }
                // 休憩終了は開始より後かつ退勤より前であること
                if (!isTimeAfter(rEnd, rStart)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: messages.REST_END_AFTER_START,
                        path: ['rests', id, 'end_time'],
                    });
                }
                if (isTimeAfter(rEnd, end)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: messages.INVALID_ATTENDANCE_TIME,
                        path: ['rests', id, 'end_time'],
                    });
                }
            }
        });

        // 3. 休憩時間同士の重複チェック
        const intervals: { start: string; end: string; id: string }[] = [];
        Object.entries(data.rests).forEach(([id, rest]) => {
            if (rest.start_time && rest.end_time) {
                intervals.push({
                    start: rest.start_time,
                    end: rest.end_time,
                    id,
                });
            }
        });

        if (intervals.length >= 2) {
            // 開始時間でソート
            intervals.sort((a, b) => (a.start > b.start ? 1 : -1));

            // 隣接する時間帯が重なっていないかチェック
            for (let i = 0; i < intervals.length - 1; i++) {
                if (isTimeAfter(intervals[i].end, intervals[i + 1].start)) {
                    // 重複している両方のフィールドにエラーを出す
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: messages.REST_TIME_OVERLAP,
                        path: ['rests', intervals[i].id, 'end_time'],
                    });
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: messages.REST_TIME_OVERLAP,
                        path: ['rests', intervals[i + 1].id, 'start_time'],
                    });
                }
            }
        }
    });

/**
 * スキーマから型を抽出
 */
export type CorrectionFormType = z.infer<typeof correctionSchema>;
