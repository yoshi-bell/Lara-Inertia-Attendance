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
        rests: Array<App.Data.RestData> | null;
        user: App.Data.UserData | null;
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
        is_admin: boolean;
    };
}
