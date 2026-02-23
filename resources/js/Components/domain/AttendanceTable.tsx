import React from 'react';
import { Link } from '@inertiajs/react';
import { Attendance } from '@/types/models';
import AppDataTable, { AppDataTableColumn } from '@/Components/ui/AppDataTable';

/**
 * 勤怠一覧テーブルの1行分のデータ型 (DTO)
 */
type AttendanceListItem = Pick<
    Attendance,
    'id' | 'start_time_hi' | 'end_time_hi' | 'total_rest_time' | 'work_time'
>;

/**
 * カレンダー表示用の1日分のデータ構造
 */
export interface CalendarDay {
    date: string;
    attendance: AttendanceListItem | null;
}

/**
 * AttendanceTable の Props 定義
 */
export interface AttendanceTableProps {
    calendarData: CalendarDay[];
    detailRouteName: string; // 'attendance.detail' または 'admin.attendance.show'
}

/**
 * 勤怠一覧を表示する共通テーブルコンポーネント
 * 
 * 【設計意図】
 * 1. 抽象化: 汎用テーブル AppDataTable を基盤とし、勤怠固有の表示ロジックを分離。
 * 2. 視認性: 出勤/退勤/休憩/合計の各項目を中央揃えで配置し、文字間隔を調整。
 */
export default function AttendanceTable({
    calendarData,
    detailRouteName,
}: AttendanceTableProps) {
    /**
     * 【Clear Code: 列定義の抽出】
     * 勤怠データの有無に応じた表示制御を、renderProp 内で完結させる。
     */
    const columns: AppDataTableColumn<CalendarDay>[] = [
        {
            header: '日付',
            key: 'date',
            className: 'w-[20%] px-10 text-left',
        },
        {
            header: '出勤',
            key: 'start_time',
            render: (day) => day.attendance?.start_time_hi || '',
        },
        {
            header: '退勤',
            key: 'end_time',
            render: (day) => day.attendance?.end_time_hi || '',
        },
        {
            header: '休憩',
            key: 'total_rest_time',
            render: (day) => day.attendance?.total_rest_time || '',
        },
        {
            header: '合計',
            key: 'work_time',
            render: (day) => day.attendance?.work_time || '',
        },
        {
            header: '詳細',
            key: 'actions',
            className: 'px-5 text-black',
            render: (day) =>
                day.attendance ? (
                    <Link
                        href={route(detailRouteName, day.attendance.id)}
                        className="hover:underline"
                    >
                        詳細
                    </Link>
                ) : (
                    '詳細'
                ),
        },
    ];

    return (
        <AppDataTable
            data={calendarData}
            columns={columns}
            rowKey="date" // 日付はユニークであるためキーとして使用
            tableClassName="tracking-[3px]" // 旧プロジェクトの文字間隔を継承
        />
    );
}
