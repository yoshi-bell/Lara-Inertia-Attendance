export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    is_admin: boolean; // 管理者フラグを追加
}

/**
 * 勤怠ステータスの定義
 * 文字列ではなくリテラル型にすることで、誤字を防ぎ、条件分岐を安全にします
 */
export type AttendanceStatusType = 'working' | 'break' | 'finished' | 'none';

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
};
