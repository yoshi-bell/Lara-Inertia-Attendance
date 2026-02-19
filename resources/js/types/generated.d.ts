declare namespace App.Data {
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
