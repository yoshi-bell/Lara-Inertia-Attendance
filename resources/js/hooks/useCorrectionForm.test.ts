import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useCorrectionForm } from './useCorrectionForm';
import { Attendance } from '@/types/models';
import React from 'react';

/* cspell:ignore inertiajs */

/**
 * useCorrectionForm カスタムフックの単体テスト
 */

// 1. route() ヘルパーのモック
const mockRoute = vi.fn((name: string, params?: unknown) => {
    return `http://localhost/${name}/${params || ''}`;
});
vi.stubGlobal('route', mockRoute);

// 2. utils の一部をモック化
vi.mock('@/lib/utils', async (importOriginal) => {
    const actual = await (importOriginal() as Promise<typeof import('@/lib/utils')>);
    return {
        ...actual,
        isAttendance: () => true, // 警告消去のためここだけ固定
    };
});

// 3. useForm のモック (Inertia)
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockSetData = vi.fn();
const mockSetError = vi.fn();
const mockClearErrors = vi.fn();

vi.mock('@inertiajs/react', () => ({
    useForm: (initialValues: unknown) => ({
        data: initialValues,
        setData: mockSetData,
        post: mockPost,
        put: mockPut,
        setError: mockSetError,
        clearErrors: mockClearErrors,
        processing: false,
        errors: {},
        reset: vi.fn(),
    }),
}));

describe('useCorrectionForm Hook', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockAttendance = {
        id: 1,
        user_id: 1,
        work_date: '2026-02-13',
        start_time_hi: '09:00',
        end_time_hi: '18:00',
        rests: [
            { id: 10, attendance_id: 1, start_time_hi: '12:00', end_time_hi: '13:00' }
        ]
    } as unknown as Attendance;

    // バリデーションを通る有効な理由
    const validReason = '修正テスト理由';

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
    });

    it('バリデーション成功時、isAdmin が true なら put メソッドが呼ばれること', () => {
        // 【重要】初期値にあらかじめ理由を注入し、バリデーションを通過させる
        const attendanceWithReason = { ...mockAttendance, reason: validReason } as unknown as Attendance;

        const { result } = renderHook(() => useCorrectionForm({
            attendance: attendanceWithReason,
            isAdmin: true
        }));

        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expect(mockPut).toHaveBeenCalled();
        expect(mockClearErrors).toHaveBeenCalled();
    });

    it('バリデーション成功時、isAdmin が false なら post メソッドが呼ばれること', () => {
        // 【重要】ここでも初期値注入
        const attendanceWithReason = { ...mockAttendance, reason: validReason } as unknown as Attendance;

        const { result } = renderHook(() => useCorrectionForm({
            attendance: attendanceWithReason,
            isAdmin: false
        }));

        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expect(mockPost).toHaveBeenCalled();
        expect(mockClearErrors).toHaveBeenCalled();
    });

    it('バリデーション失敗時（理由が空など）、送信メソッドが呼ばれないこと', () => {
        // 理由が空のままのデータを渡す
        const { result } = renderHook(() => useCorrectionForm({
            attendance: mockAttendance,
            isAdmin: false
        }));

        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        act(() => {
            result.current.handleSubmit(mockEvent);
        });

        expect(mockPost).not.toHaveBeenCalled();
        expect(mockSetError).toHaveBeenCalledWith('reason', expect.stringContaining('備考を記入してください'));
    });
});
