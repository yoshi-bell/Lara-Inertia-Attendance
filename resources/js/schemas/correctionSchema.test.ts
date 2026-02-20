import { describe, it, expect } from 'vitest';
import { correctionSchema } from './correctionSchema';
import messages from '@/constants/validation_messages.json';

/**
 * correctionSchema (Zod) のバリデーションロジック検証
 */
describe('correctionSchema Validation Logic', () => {
    const validBaseData = {
        requested_start_time: '09:00',
        requested_end_time: '18:00',
        reason: '修正理由です',
        rests: {
            '1': { start_time: '12:00', end_time: '13:00' },
        },
    };

    it('正常なデータが通過すること', () => {
        const result = correctionSchema.safeParse(validBaseData);
        expect(result.success).toBe(true);
    });

    it('出退勤の順序が逆転している場合にエラーを出すこと', () => {
        const invalidData = {
            ...validBaseData,
            requested_start_time: '18:00',
            requested_end_time: '09:00',
        };
        const result = correctionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(messages.INVALID_ATTENDANCE_TIME);
            expect(result.error.issues[0].path).toContain('requested_end_time');
        }
    });

    describe('休憩時間の重複チェック', () => {
        it('複数の休憩時間が重複している場合にエラーを出すこと', () => {
            const overlappedData = {
                ...validBaseData,
                rests: {
                    '1': { start_time: '12:00', end_time: '13:00' },
                    '2': { start_time: '12:30', end_time: '13:30' }, // '1'と重複
                },
            };
            const result = correctionSchema.safeParse(overlappedData);
            expect(result.success).toBe(false);
            if (!result.success) {
                // 重複を検知し、適切なメッセージが含まれているか
                const overlapIssues = result.error.issues.filter(
                    (i) => i.message === messages.REST_TIME_OVERLAP
                );
                expect(overlapIssues.length).toBeGreaterThanOrEqual(1);
            }
        });

        it('休憩時間が接している（重複していない）場合は通過すること', () => {
            const adjoiningData = {
                ...validBaseData,
                rests: {
                    '1': { start_time: '12:00', end_time: '13:00' },
                    '2': { start_time: '13:00', end_time: '14:00' }, // 接しているが重複なし
                },
            };
            const result = correctionSchema.safeParse(adjoiningData);
            expect(result.success).toBe(true);
        });
    });

    describe('範囲外・入力漏れチェック', () => {
        it('休憩が出勤時間より前にある場合にエラーを出すこと', () => {
            const outOfRangeData = {
                ...validBaseData,
                rests: {
                    '1': { start_time: '08:00', end_time: '08:30' },
                },
            };
            const result = correctionSchema.safeParse(outOfRangeData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(messages.INVALID_REST_TIME);
            }
        });

        it('休憩の終了時間が入力されていない場合にエラーを出すこと', () => {
            const missingEndData = {
                ...validBaseData,
                rests: {
                    'new': { start_time: '15:00', end_time: '' },
                },
            };
            const result = correctionSchema.safeParse(missingEndData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(messages.REST_END_REQUIRED);
            }
        });
    });
});
