import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useCorrectionForm } from './useCorrectionForm';
import React from 'react';

/* cspell:ignore inertiajs */

/**
 * useCorrectionForm カスタムフックの単体テスト
 * ESLint / TypeScript 規約準拠版
 */

// 1. route() ヘルパーのモックを定義し、グローバルに登録
const mockRoute = vi.fn((name: string, params?: unknown) => {
    return `http://localhost/${name}/${params || ''}`;
});
vi.stubGlobal('route', mockRoute);

// 2. useForm のモック
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockSetData = vi.fn();

vi.mock('@inertiajs/react', () => ({
    useForm: (initialValues: unknown) => ({
        data: initialValues,
        setData: mockSetData,
        post: mockPost,
        put: mockPut,
        processing: false,
        errors: {},
        reset: vi.fn(),
        clearErrors: vi.fn(),
    }),
}));

describe('useCorrectionForm Hook', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    // モックデータを型安全に定義 (新しい AttendanceData 規格に適合)
    const mockAttendance = {
        id: 1,
        user_id: 1,
        work_date: '2026-02-13',
        start_time_hi: '09:00',
        end_time_hi: '18:00',
        total_rest_time: '01:00',
        work_time: '08:00',
        is_editable: true,
        updated_at: '2026-02-13T00:00:00Z',
        user: { id: 1, name: 'テストユーザー', email: 'test@example.com', is_admin: false },
        rests: [
            { id: 10, attendance_id: 1, start_time_hi: '12:00', end_time_hi: '13:00' }
        ]
    } as unknown as App.Data.AttendanceData;

    it('初期値が正しくフラットな構造に変換されること', () => {
        const { result } = renderHook(() => useCorrectionForm({
            attendance: mockAttendance,
            isAdmin: false
        }));

        expect(result.current.data.requested_start_time).toBe('09:00');
        expect(result.current.data.rests[10]).toEqual({
            start_time: '12:00',
            end_time: '13:00'
        });
        expect(result.current.data.rests['new']).toBeDefined();
    });

    it('isAdmin が true の場合、put メソッドが管理者用ルートで呼ばれること', () => {
        const { result } = renderHook(() => useCorrectionForm({
            attendance: mockAttendance,
            isAdmin: true
        }));

        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockRoute).toHaveBeenCalledWith('admin.attendance.update', 1);
        expect(mockPut).toHaveBeenCalledWith(
            expect.stringContaining('admin.attendance.update'),
            expect.objectContaining({ preserveScroll: true })
        );
    });

    it('isAdmin が false の場合、post メソッドが一般用ルートで呼ばれること', () => {
        const { result } = renderHook(() => useCorrectionForm({
            attendance: mockAttendance,
            isAdmin: false
        }));

        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expect(mockPost).toHaveBeenCalledWith(
            expect.stringContaining('attendances.correction.store'),
            expect.any(Object)
        );
    });
});
