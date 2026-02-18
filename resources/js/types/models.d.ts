import { CorrectionStatus } from '@/constants';

/**
 * サーバー駆動型 SSOT (Single Source of Truth)
 * 自動生成された型定義 (generated.d.ts) をベースに、モデル型を再定義・統合
 */

/**
 * ユーザー型 (自動生成版を優先)
 */
export type User = App.Data.UserData;

/**
 * 勤怠記録型 (自動生成版を優先)
 */
export type Attendance = App.Data.AttendanceData;

/**
 * 休憩記録型 (自動生成版を優先)
 */
export type Rest = App.Data.RestData;

/**
 * 勤怠修正申請 (attendance_corrections table)
 * TODO: 次のフェーズで App.Data.AttendanceCorrectionData へ移行予定
 */
export interface AttendanceCorrection {
    id: number;
    attendance_id: number;
    user_id: number;
    requested_start_time: string;
    requested_end_time: string;
    requested_start_time_hi?: string;
    requested_end_time_hi?: string;
    reason: string;
    status: CorrectionStatus;
    reviewed_at: string | null;
    reviewer_id: number | null;
    created_at: string;
    updated_at: string;

    // リレーション (手動定義版)
    attendance: Attendance;
    requester?: { name: string };
}

/**
 * 休憩時間の修正申請 (rest_corrections table)
 */
export interface RestCorrection {
    id: number;
    attendance_correction_id: number;
    rest_id: number | null;
    requested_start_time: string;
    requested_end_time: string | null;
    requested_start_time_hi?: string;
    requested_end_time_hi?: string;
    created_at: string;
    updated_at: string;
}
