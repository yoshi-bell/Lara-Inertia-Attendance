import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import CorrectionForm from './CorrectionForm';
import { Attendance, Rest, AttendanceCorrection, RestCorrection } from '@/types/models';
import { CorrectionFormType } from '@/hooks/useCorrectionForm';

/**
 * CorrectionForm コンポーネントの UI 網羅テスト
 */
describe('CorrectionForm Component', () => {
    // 共通のモックデータ
    const mockAttendance = {
        id: 1,
        work_date: '2026-02-12',
        start_time_hi: '09:00',
        end_time_hi: '18:00',
        rests: [] as Rest[],
        user: { name: 'テスト太郎' }
    } as unknown as Attendance & { user: { name: string }; rests: Rest[] };

    // showPicker のモック化（jsdom 未実装対応）
    const showPickerMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // prototype にモックを刺す
        HTMLInputElement.prototype.showPicker = showPickerMock;
    });

    it('編集モード：入力フィールドが正しい初期値で表示され、クリックでピッカーが開くこと', () => {
        const mockData: CorrectionFormType = {
            requested_start_time: '09:00',
            requested_end_time: '18:00',
            rests: { 'new': { start_time: '', end_time: '' } },
            reason: '修正理由です',
        };
        const mockSetData = vi.fn();

        render(
            <CorrectionForm
                attendance={mockAttendance}
                pendingCorrection={null}
                data={mockData}
                setData={mockSetData}
                errors={{}}
            />
        );

        // 1. 初期値の検証（タグ名を含めて厳密に）
        const startTimeInput = screen.getAllByDisplayValue('09:00').find(el => el.tagName === 'INPUT') as HTMLInputElement;
        expect(startTimeInput).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('修正理由です');

        // 2. showPicker の検証（振る舞い）
        fireEvent.click(startTimeInput);
        expect(showPickerMock).toHaveBeenCalled();
    });

    it('閲覧モード：入力フィールドが表示されず、申請内容がテキストとして表示されること', () => {
        const mockPending = {
            id: 100,
            reason: '電車遅延',
            requested_start_time_hi: '09:30',
            requested_end_time_hi: '18:30',
            status: 'pending',
            rest_corrections: []
        } as unknown as AttendanceCorrection & { rest_corrections: RestCorrection[] };

        render(
            <CorrectionForm
                attendance={mockAttendance}
                pendingCorrection={mockPending}
            />
        );

        // 入力欄が存在しないこと
        expect(screen.queryByRole('textbox')).toBeNull();

        // テキスト表示の検証
        expect(screen.getByText('09:30')).toBeInTheDocument();
        expect(screen.getByText('18:30')).toBeInTheDocument();
        expect(screen.getByText('電車遅延')).toBeInTheDocument();
    });

    it('バリデーション表示：エラー時に指定の色（#FF0000）でメッセージが表示されること', () => {
        const mockData: CorrectionFormType = {
            requested_start_time: '09:00',
            requested_end_time: '18:00',
            rests: { 'new': { start_time: '', end_time: '' } },
            reason: '',
        };
        const mockErrors = {
            reason: '備考を入力してください'
        };

        render(
            <CorrectionForm
                attendance={mockAttendance}
                pendingCorrection={null}
                data={mockData}
                setData={vi.fn()}
                errors={mockErrors}
            />
        );

        const errorMsg = screen.getByText('備考を入力してください');
        expect(errorMsg).toBeInTheDocument();
        expect(errorMsg).toHaveClass('text-[#FF0000]');
    });

    it('動的フォーム：休憩データ数に応じて「休憩n」ラベルと入力欄が正しく表示されること', () => {
        // 1. フォームの状態データ
        const mockData: CorrectionFormType = {
            requested_start_time: '09:00',
            requested_end_time: '18:00',
            rests: {
                '10': { start_time: '12:00', end_time: '12:30' },
                '11': { start_time: '15:00', end_time: '15:15' },
                'new': { start_time: '', end_time: '' }
            },
            reason: '',
        };

        // 2. マスタデータも増やさないとループが回らない（実装準拠）
        const dynamicAttendance = {
            ...mockAttendance,
            rests: [
                { id: 10, start_time_hi: '12:00', end_time_hi: '12:30' },
                { id: 11, start_time_hi: '15:00', end_time_hi: '15:15' }
            ] as Rest[]
        };

        render(
            <CorrectionForm
                attendance={dynamicAttendance}
                pendingCorrection={null}
                data={mockData}
                setData={vi.fn()}
                errors={{}}
            />
        );

        // 既存休憩(2件) + 新規追加(1件) = 合計3つの「休憩n」ラベルがあるはず
        expect(screen.getByText('休憩1')).toBeInTheDocument();
        expect(screen.getByText('休憩2')).toBeInTheDocument();
        expect(screen.getByText('休憩3')).toBeInTheDocument();
        
        // 各休憩時間の値が表示されていること
        expect(screen.getByDisplayValue('12:00')).toBeInTheDocument();
        expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
    });
});
