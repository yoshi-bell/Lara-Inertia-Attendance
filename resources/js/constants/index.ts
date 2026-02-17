/**
 * アプリケーション共通定数定義
 */

/**
 * 勤怠ステータス
 */
export const ATTENDANCE_STATUS = {
    WORKING: 'working',
    BREAK: 'break',
    FINISHED: 'finished',
    NONE: 'none',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

/**
 * 修正申請ステータス
 */
export const CORRECTION_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
} as const;

export type CorrectionStatus = (typeof CORRECTION_STATUS)[keyof typeof CORRECTION_STATUS];

/**
 * 曜日の定義（DatePicker等で使用）
 */
export const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'] as const;
