/**
 * プロジェクト共有ユーティリティ型定義
 * 
 * 目的: エンジニアとしての成長
 * 目標: 型安全性の最大化および Findy スコアの向上を指標とする
 */

/**
 * T の直下のプロパティから null と undefined を排除する (シャロー)
 */
export type NonNullableFields<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};

/**
 * 【型ユーティリティ: Clear Code 対応】
 * 指定したユニオン型（T）のエディタ補完を維持しつつ、任意の文字列（string）も許容するための型。
 * 
 * 【Why: 型ハックの隠蔽】
 * 通常 T | string と書くと補完が消えてただの string になりますが、
 * (string & {}) という交差型を使うことでコンパイラの Widening を防ぎ、
 * サジェストを維持したまま自由入力を許可できます。
 */
export type LooseStringAutocomplete<T> = T | (string & {});

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
