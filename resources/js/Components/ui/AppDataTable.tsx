import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { cn } from '@/lib/utils';
import { LooseStringAutocomplete } from '@/types/utils';

/**
 * 汎用テーブルの列定義インターフェース (Grade S)
 */
export interface AppDataTableColumn<T> {
    /** ヘッダーに表示する文字列 */
    header: string;
    /** 
     * 列を識別するためのキー。
     * T のプロパティ名を補完しつつ、'actions' などの任意の文字列も許容する。
     */
    key: LooseStringAutocomplete<Extract<keyof T, string>>;
    /** 列全体のスタイル */
    className?: string;
    /** ヘッダーセル専用スタイル */
    headerClassName?: string;
    /** ボディセル専用スタイル */
    cellClassName?: string;
    /** セルの内容をカスタマイズするレンダリング関数 */
    render?: (item: T, index: number) => React.ReactNode;
}

/**
 * 汎用テーブルコンポーネントの Props
 */
interface AppDataTableProps<T> {
    data: T[];
    columns: AppDataTableColumn<T>[];
    /** 行のユニークキーを抽出するプロパティ名、または関数 */
    rowKey: keyof T | ((item: T, index: number) => string | number);
    emptyMessage?: string;
    containerClassName?: string;
    tableClassName?: string;
}

/**
 * プロジェクト共通のデータテーブルコンポーネント (Phase 4 抽象化・洗練版)
 */
export default function AppDataTable<T>({
    data,
    columns,
    rowKey,
    emptyMessage = '該当するデータはありません。',
    containerClassName,
    tableClassName,
}: AppDataTableProps<T>) {
    /**
     * 行のキーを安全に取得
     */
    const getRowKey = (item: T, index: number): string | number => {
        if (typeof rowKey === 'function') {
            return rowKey(item, index);
        }
        // string か number であることを前提としてキャスト
        return item[rowKey] as string | number;
    };

    return (
        <div
            className={cn(
                'overflow-hidden rounded-[10px] bg-white shadow-sm',
                containerClassName
            )}
        >
            <Table
                className={cn(
                    'text-center font-bold tracking-normal text-[#737373]',
                    tableClassName
                )}
            >
                <TableHeader className="border-b-[3px] border-[#E1E1E1]">
                    <TableRow className="h-[45px] hover:bg-transparent">
                        {columns.map((col) => (
                            <TableHead
                                key={col.key}
                                className={cn(
                                    'font-bold text-[#737373]',
                                    col.className,
                                    col.headerClassName
                                )}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <TableRow
                                key={getRowKey(item, index)}
                                className={cn(
                                    'h-[60px] border-[#E1E1E1] hover:bg-gray-50',
                                    index !== data.length - 1
                                        ? 'border-b-2'
                                        : 'border-b-0'
                                )}
                            >
                                {columns.map((col) => {
                                    // render がない場合はデータから直接取得（型安全なアクセス）
                                    const cellValue = col.render
                                        ? col.render(item, index)
                                        : (item[
                                              col.key as keyof T
                                          ] as React.ReactNode);

                                    return (
                                        <TableCell
                                            key={col.key}
                                            className={cn(
                                                col.className,
                                                col.cellClassName
                                            )}
                                        >
                                            {cellValue}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-32 text-center text-gray-400"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
