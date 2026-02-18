import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AttendanceTable, { CalendarDay } from './AttendanceTable';

/**
 * AttendanceTable コンポーネントの単体テスト
 * 偏差値向上ポイント: 共通コンポーネントの挙動（Propsによるリンク先切り替え）の正確な検証
 * ベストプラクティス: within を用いたスコープ限定検索の適用
 */

// route() ヘルパーのモック（ルート名のドットをスラッシュに置換してURLっぽくする）
const mockRoute = vi.fn(
    (name: string, id: number) => `/${name.replace(/\./g, '/')}/${id}`
);
vi.stubGlobal('route', mockRoute);

describe('AttendanceTable Component', () => {
    const mockCalendarData: CalendarDay[] = [
        {
            date: '2026/02/12（木）',
            attendance: {
                id: 101,
                start_time_hi: '09:00',
                end_time_hi: '18:00',
                total_rest_time: '01:00',
                work_time: '08:00',
            },
        },
        {
            date: '2026/02/13（金）',
            attendance: null, // 勤怠データなしのケース
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('一般ユーザーモード：正しいルート名で詳細リンクが生成されること', () => {
        render(
            <AttendanceTable
                calendarData={mockCalendarData}
                detailRouteName="attendance.detail"
            />
        );

        // リンク（role="link"）を取得し、href属性を検証
        const detailLink = screen.getByRole('link', { name: '詳細' });

        expect(mockRoute).toHaveBeenCalledWith('attendance.detail', 101);
        expect(detailLink).toHaveAttribute('href', '/attendance/detail/101');
    });

    it('管理者モード：管理者用のルート名で詳細リンクが生成されること', () => {
        render(
            <AttendanceTable
                calendarData={mockCalendarData}
                detailRouteName="admin.attendance.show"
            />
        );

        const detailLink = screen.getByRole('link', { name: '詳細' });

        expect(mockRoute).toHaveBeenCalledWith('admin.attendance.show', 101);
        expect(detailLink).toHaveAttribute(
            'href',
            '/admin/attendance/show/101'
        );
    });

    it('勤怠データがない行では、リンクではなくプレーンテキストが表示されること', () => {
        render(
            <AttendanceTable
                calendarData={mockCalendarData}
                detailRouteName="attendance.detail"
            />
        );

        // 1. 対象の行（TR要素）を日付テキストを起点に取得
        const row = screen.getByText('2026/02/13（金）').closest('tr');
        expect(row).toBeInTheDocument();

        // 2. within を使用して、その行内だけで「リンク」を探すが、存在しないことを確認
        // queryByRole は見つからない場合に null を返す
        const linkInRow = within(row!).queryByRole('link');
        expect(linkInRow).toBeNull();

        // 3. その行の中にテキストとしての「詳細」があることを確認
        expect(within(row!).getByText('詳細')).toBeInTheDocument();
    });

    it('テーブルのヘッダーおよび勤怠データが正しく表示されていること', () => {
        render(
            <AttendanceTable
                calendarData={mockCalendarData}
                detailRouteName="attendance.detail"
            />
        );

        // ヘッダーカラムがすべて存在するか（役割 role="columnheader" で特定することで複数マッチを回避）
        const headers = ['日付', '出勤', '退勤', '休憩', '合計', '詳細'];
        headers.forEach((header) => {
            expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
        });

        // 1行目のデータが正しくレンダリングされているか（行内のみを検索）
        const firstRow = screen.getByText('2026/02/12（木）').closest('tr');
        expect(firstRow).toBeInTheDocument();
        
        expect(within(firstRow!).getByText('09:00')).toBeInTheDocument();
        expect(within(firstRow!).getByText('18:00')).toBeInTheDocument();
        expect(within(firstRow!).getByText('01:00')).toBeInTheDocument();
        expect(within(firstRow!).getByText('08:00')).toBeInTheDocument();
    });
});
