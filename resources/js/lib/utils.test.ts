import { describe, it, expect } from 'vitest';
import {
    isObject,
    isUser,
    isAttendance,
    isTimeAfter,
    isTimeBeforeOrEqual,
    formatMessage,
} from './utils';

describe('isObject utility', () => {
    it('オブジェクトを渡したときに true を返すこと', () => {
        expect(isObject({ a: 1 })).toBe(true);
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true); // 配列も JS では object
    });

    it('null を渡したときに false を返すこと', () => {
        expect(isObject(null)).toBe(false);
    });

    it('プリミティブ値を渡したときに false を返すこと', () => {
        expect(isObject(123)).toBe(false);
        expect(isObject('string')).toBe(false);
        expect(isObject(true)).toBe(false);
        expect(isObject(undefined)).toBe(false);
    });

    it('型ガードとして機能すること', () => {
        const data: unknown = { key: 'value' };

        if (isObject(data)) {
            // ここで data['key'] にアクセスしても型エラーにならない（Record<string, unknown> への絞り込み）
            expect(data.key).toBe('value');
        }
    });
});

describe('Domain Type Guards', () => {
    const mockUser = {
        id: 1,
        name: 'テスト',
        email: 'test@example.com',
        is_admin: false,
    };
    const mockAttendance = {
        id: 10,
        work_date: '2026-02-17',
        start_time_hi: '09:00',
    };

    it('isUser: 正しい User データを true と判定すること', () => {
        expect(isUser(mockUser)).toBe(true);
    });

    it('isUser: 欠落のあるデータを false と判定すること', () => {
        expect(isUser({ id: 1, name: 'テスト' })).toBe(false);
        expect(isUser(null)).toBe(false);
    });

    it('isUser: キーが存在しても値の型が違う場合は false と判定すること', () => {
        const invalidUser = { id: 'bad-id', name: 123, email: [] };
        expect(isUser(invalidUser)).toBe(false);
    });

    it('isAttendance: 正しい Attendance データを true と判定すること', () => {
        expect(isAttendance(mockAttendance)).toBe(true);
    });

    it('isAttendance: キーが存在しても値の型が違う場合は false と判定すること', () => {
        const invalidAttendance = {
            id: 10,
            work_date: 20260217,
            start_time_hi: true,
        };
        expect(isAttendance(invalidAttendance)).toBe(false);
    });

    it('isAttendance: 無関係なデータを false と判定すること', () => {
        expect(isAttendance(mockUser)).toBe(false);
    });
});

describe('Time Comparison Utilities', () => {
    describe('isTimeAfter', () => {
        it('time1 が time2 より後の場合は true を返すこと', () => {
            expect(isTimeAfter('10:00', '09:00')).toBe(true);
            expect(isTimeAfter('18:00', '09:00')).toBe(true);
        });

        it('time1 が time2 以前の場合は false を返すこと', () => {
            expect(isTimeAfter('09:00', '10:00')).toBe(false);
            expect(isTimeAfter('09:00', '09:00')).toBe(false);
        });

        it('引数が空の場合は false を返すこと', () => {
            expect(isTimeAfter('', '09:00')).toBe(false);
            expect(isTimeAfter('09:00', '')).toBe(false);
        });
    });

    describe('isTimeBeforeOrEqual', () => {
        it('time1 が time2 以前の場合は true を返すこと', () => {
            expect(isTimeBeforeOrEqual('09:00', '10:00')).toBe(true);
            expect(isTimeBeforeOrEqual('09:00', '09:00')).toBe(true);
        });

        it('time1 が time2 より後の場合は false を返すこと', () => {
            expect(isTimeBeforeOrEqual('10:00', '09:00')).toBe(false);
        });

        it('引数が空の場合は false を返すこと', () => {
            expect(isTimeBeforeOrEqual('', '09:00')).toBe(false);
        });
    });

    describe('formatMessage', () => {
        it(':min, :max 等のプレースホルダーを正しく置換すること', () => {
            const msg = 'パスワードは:min文字以上で入力してください';
            expect(formatMessage(msg, { min: 8 })).toBe('パスワードは8文字以上で入力してください');
        });

        it('複数のプレースホルダーを置換できること', () => {
            const msg = ':fieldは:minから:maxの範囲で入力してください';
            expect(formatMessage(msg, { field: '年齢', min: 18, max: 99 }))
                .toBe('年齢は18から99の範囲で入力してください');
        });

        it('該当するキーがない場合はそのままの文字列を返すこと', () => {
            const msg = 'テストメッセージ';
            expect(formatMessage(msg, { unknown: 'value' })).toBe('テストメッセージ');
        });
    });
});
