import { describe, it, expect } from 'vitest';
import { isObject, isUser, isAttendance } from './utils';

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
    const mockUser = { id: 1, name: 'テスト', email: 'test@example.com', is_admin: false };
    const mockAttendance = { id: 10, work_date: '2026-02-17', start_time: '2026-02-17 09:00:00' };

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
        const invalidAttendance = { id: 10, work_date: 20260217, start_time: true };
        expect(isAttendance(invalidAttendance)).toBe(false);
    });

    it('isAttendance: 無関係なデータを false と判定すること', () => {
        expect(isAttendance(mockUser)).toBe(false);
    });
});
