import React from 'react';
import { Link } from '@inertiajs/react';
import { AttendanceCorrection } from '@/types/models';
import { CORRECTION_STATUS, CorrectionStatus } from '@/constants';
import AppDataTable, { AppDataTableColumn } from '@/Components/ui/AppDataTable';

/**
 * 修正申請リストの共通コンポーネント Props
 */
export interface CorrectionListProps {
    corrections: AttendanceCorrection[];
    status: CorrectionStatus;
    isAdmin?: boolean;
    currentUserName?: string;
}

/**
 * 修正申請一覧コンポーネント
 * 
 * 【設計意図】
 * 1. 抽象化: AppDataTable を使用し、一覧表示のロジックを宣言的に記述。
 * 2. 視認性: 承認待ち/済みのタブ切り替えと、それに応じたリンク・状態表示の自動制御。
 */
export default function CorrectionList({
    corrections,
    status,
    isAdmin = false,
    currentUserName,
}: CorrectionListProps) {
    // タブ切り替えのベースパスを設計書通りに指定
    const basePath = isAdmin
        ? '/admin/stamp_correction_request/list'
        : '/stamp_correction_request/list';

    /**
     * 日付文字列を yyyy/MM/dd 形式にフォーマットする
     */
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}/${m}/${d}`;
    };

    /**
     * 【Clear Code: 列定義の抽出】
     * テーブルの各列の定義を説明変数として定義。
     * 表示ロジックをここへ集約することで、テーブル本体の可読性を高める。
     */
    const columns: AppDataTableColumn<AttendanceCorrection>[] = [
        {
            header: '状態',
            key: 'status',
            render: (item) =>
                item.status === CORRECTION_STATUS.PENDING ? '承認待ち' : '承認済み',
        },
        {
            header: '名前',
            key: 'user_name',
            render: (item) => (isAdmin ? item.requester?.name : currentUserName),
        },
        {
            header: '対象日時',
            key: 'work_date',
            render: (item) =>
                item.attendance?.work_date
                    ? formatDate(item.attendance.work_date)
                    : '',
        },
        {
            header: '申請理由',
            key: 'reason',
            className: 'max-w-[200px] truncate',
        },
        {
            header: '申請日時',
            key: 'created_at',
            render: (item) => formatDate(item.created_at),
        },
        {
            header: '詳細',
            key: 'actions',
            render: (item) => (
                <Link
                    href={
                        isAdmin
                            ? route('admin.corrections.approve.show', item.id)
                            : route('attendance.detail', item.attendance_id)
                    }
                    className="text-black hover:underline"
                >
                    詳細
                </Link>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            {/* タブメニュー */}
            <div className="flex border-b-2 border-gray-200">
                <Link
                    href={`${basePath}?status=${CORRECTION_STATUS.PENDING}`}
                    className={`px-8 py-2 text-xl font-bold transition-colors ${
                        status === CORRECTION_STATUS.PENDING
                            ? 'border-b-4 border-black text-black'
                            : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    承認待ち
                </Link>
                <Link
                    href={`${basePath}?status=${CORRECTION_STATUS.APPROVED}`}
                    className={`px-8 py-2 text-xl font-bold transition-colors ${
                        status === CORRECTION_STATUS.APPROVED
                            ? 'border-b-4 border-black text-black'
                            : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    承認済み
                </Link>
            </div>

            {/* 汎用データテーブルによる申請一覧 */}
            <AppDataTable
                data={corrections}
                columns={columns}
                rowKey="id"
                emptyMessage="該当する申請はありません。"
            />
        </div>
    );
}
