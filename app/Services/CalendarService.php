<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;

class CalendarService
{
    /**
     * 指定ユーザーの月次勤怠カレンダーデータを生成する
     * 
     * @param User $user
     * @param Carbon $currentDate
     * @return array<int, array{
     *     date: string,
     *     attendance: array{
     *         id: int,
     *         start_time: string|null,
     *         end_time: string|null,
     *         total_rest_time: string,
     *         work_time: string|null
     *     }|null
     * }>
     */
    public function generate(User $user, Carbon $currentDate): array
    {
        // その月の勤怠データを一括取得 (N+1問題回避のため休憩もEager Loading)
        $attendances = Attendance::with('rests')
            ->where('user_id', $user->id)
            ->whereYear('work_date', $currentDate->year)
            ->whereMonth('work_date', $currentDate->month)
            ->get()
            ->keyBy(fn ($item) => $item->work_date->day);

        $daysInMonth = $currentDate->daysInMonth;
        $calendarData = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = $currentDate->copy()->day($day);
            $attendance = $attendances->get($day);

            $calendarData[] = [
                'date' => Attendance::getFormattedDateWithDay($date, 'm/d'),
                'attendance' => $attendance ? [
                    'id' => $attendance->id,
                    'start_time' => $attendance->start_time?->format('H:i'),
                    'end_time' => $attendance->end_time?->format('H:i'),
                    'total_rest_time' => $attendance->total_rest_time,
                    'work_time' => $attendance->work_time,
                ] : null,
            ];
        }

        return $calendarData;
    }
}
