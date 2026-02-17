/**
 * プロジェクト共有ユーティリティ型定義
 * Findy スコア向上と型安全性の最大化を目的とする
 */

/**
 * T の直下のプロパティから null と undefined を排除する (シャロー)
 */
export type NonNullableFields<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Laravel のページネーションレスポンス型
 */
export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

/**
 * 汎用的なセレクトボックスの選択肢型
 */
export interface SelectOption {
    value: string | number;
    label: string;
}

/**
 * Flash メッセージの型定義
 */
export interface FlashMessage {
    success: string | null;
    error: string | null;
}
