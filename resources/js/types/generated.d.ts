declare namespace App.Data {
    export type AttendanceCorrectionData = {
        id: number;
        attendance_id: number;
        user_id: number;
        requested_start_time: string;
        requested_end_time: string;
        requested_start_time_hi: string | null;
        requested_end_time_hi: string | null;
        reason: string;
        status: string;
        reviewed_at: string | null;
        reviewer_id: number | null;
        created_at: string;
        updated_at: string;
        attendance: App.Data.AttendanceData | null;
        rest_corrections: Array<App.Data.RestCorrectionData> | null;
        requester: App.Data.UserData | null;
    };
    export type AttendanceData = {
        id: number;
        user_id: number;
        work_date: string;
        start_time_hi: string | null;
        end_time_hi: string | null;
        total_rest_time: string | null;
        work_time: string | null;
        is_editable: boolean;
        updated_at: string;
        rests: Array<App.Data.RestData>;
        user: App.Data.UserData;
    };
    export type RestCorrectionData = {
        id: number;
        attendance_correction_id: number;
        rest_id: number | null;
        requested_start_time: string;
        requested_end_time: string | null;
        requested_start_time_hi: string | null;
        requested_end_time_hi: string | null;
        created_at: string;
        updated_at: string;
    };
    export type RestData = {
        id: number;
        attendance_id: number;
        start_time_hi: string | null;
        end_time_hi: string | null;
    };
    export type UserData = {
        id: number;
        name: string;
        email: string;
        email_verified_at: string | null;
        is_admin: boolean;
    };
}
