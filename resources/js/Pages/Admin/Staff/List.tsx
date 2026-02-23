import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { User } from '@/types/models';
import AppDataTable, { AppDataTableColumn } from '@/Components/ui/AppDataTable';

type AdminStaffListProps = PageProps<{
    staffs: User[];
}>;

/**
 * 管理者用スタッフ一覧画面 (US012 対応)
 * 
 * 【設計意図】
 * 1. 抽象化: 汎用テーブル AppDataTable を使用し、スタッフ情報の表示ロジックを宣言的に記述。
 * 2. デザイン再現: 旧プロジェクト固有のパディング（名前列の 96px など）を精密に再現。
 * 
 * @param {AdminStaffListProps} props
 * @returns {JSX.Element} スタッフ一覧コンポーネント
 */
export default function List({ staffs }: AdminStaffListProps) {
    /**
     * 【Clear Code: 列定義の抽出】
     * 各列の表示スタイルとリンク生成ロジックを説明変数として定義。
     */
    const columns: AppDataTableColumn<User>[] = [
        {
            header: '名前',
            key: 'name',
            className: 'w-[35%] pl-[96px] text-left',
            cellClassName: 'text-black',
        },
        {
            header: 'メールアドレス',
            key: 'email',
            className: 'text-left',
            cellClassName: 'font-normal text-[#737373]',
        },
        {
            header: '月次勤怠',
            key: 'actions',
            className: 'w-[30%] pr-[30px] text-center',
            render: (staff) => (
                <Link
                    href={route('admin.staff.attendance.show', staff.id)}
                    className="text-black hover:underline"
                >
                    詳細
                </Link>
            ),
        },
    ];

    return (
        <AttendanceLayout title="スタッフ一覧">
            <Head title="スタッフ一覧" />

            <AppDataTable
                data={staffs}
                columns={columns}
                rowKey="id"
                emptyMessage="スタッフが登録されていません。"
                tableClassName="tracking-[3px]"
            />
        </AttendanceLayout>
    );
}
