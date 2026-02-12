import { User as BaseUser } from './index';

export type User = BaseUser;

/**
 * 勤怠記録 (attendances table)
 */
export interface Attendance {
    id: number;
    user_id: number;
    work_date: string; // YYYY-MM-DD
    start_time: string | null;
    end_time: string | null;
    created_at: string;
    updated_at: string;

    // 計算済みのプロパティ (App\Models\Attendance のアクセサに対応)
    total_rest_time?: string; // H:i
    work_time?: string | null; // H:i
    start_time_hi?: string; // H:i
    end_time_hi?: string;   // H:i

    // リレーション
    user?: User;
    rests?: Rest[];
}

/**
 * 休憩記録 (rests table)
 */
export interface Rest {
    id: number;
    attendance_id: number;
    start_time: string;
    end_time: string | null;
    start_time_hi?: string;
    end_time_hi?: string;
    created_at: string;
    updated_at: string;
}

/**
 * 勤怠修正申請 (attendance_corrections table)
 */
export interface AttendanceCorrection {
    id: number;
    attendance_id: number;
    user_id: number;
    requested_start_time: string; // 追加
    requested_end_time: string;   // 追加
    requested_start_time_hi?: string;
    requested_end_time_hi?: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_at: string | null;
    reviewer_id: number | null;
    created_at: string;
    updated_at: string;
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
