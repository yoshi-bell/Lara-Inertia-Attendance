<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * 指定したユーザーの現在の勤務ステータスを取得する
     */
    public function getCurrentStatus(User $user): array
    {
        $today = Carbon::today();

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('work_date', $today)
            ->first();

        if (! $attendance) {
            return [
                'statusText' => '勤務外',
                'isWorking' => false,
                'isOnBreak' => false,
                'hasFinishedWork' => false,
            ];
        }

        if ($attendance->end_time) {
            return [
                'statusText' => '勤務終了',
                'isWorking' => false,
                'isOnBreak' => false,
                'hasFinishedWork' => true,
            ];
        }

        $latestRest = $attendance->rests()->latest()->first();
        $isOnBreak = $latestRest && ! $latestRest->end_time;

        return [
            'statusText' => $isOnBreak ? '休憩中' : '勤務中',
            'isWorking' => true,
            'isOnBreak' => $isOnBreak,
            'hasFinishedWork' => false,
        ];
    }

    /**
     * 出勤処理
     */
    public function startWork(User $user): void
    {
        $today = Carbon::today();

        // 二重出勤チェック
        $exists = Attendance::where('user_id', $user->id)
            ->whereDate('work_date', $today)
            ->exists();

        if (! $exists) {
            Attendance::create([
                'user_id' => $user->id,
                'work_date' => $today,
                'start_time' => Carbon::now(),
            ]);
        }
    }

    /**
     * 退勤処理
     */
    public function endWork(User $user): void
    {
        $today = Carbon::today();

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('work_date', $today)
            ->whereNull('end_time')
            ->first();

        if ($attendance) {
            // 休憩中の場合は退勤不可とする（旧プロジェクト継承）
            $latestRest = $attendance->rests()->latest()->first();
            $isOnBreak = $latestRest && ! $latestRest->end_time;

            if (! $isOnBreak) {
                $attendance->update([
                    'end_time' => Carbon::now(),
                ]);
            }
        }
    }

    /**
     * 休憩開始処理
     */
    public function startRest(User $user): void
    {
        $attendance = $this->getWorkingAttendance($user);

        if ($attendance) {
            // 二重休憩開始チェック
            $latestRest = $attendance->rests()->latest()->first();
            if (! $latestRest || $latestRest->end_time) {
                $attendance->rests()->create([
                    'start_time' => Carbon::now(),
                ]);
            }
        }
    }

    /**
     * 休憩終了処理
     */
    public function endRest(User $user): void
    {
        $attendance = $this->getWorkingAttendance($user);

        if ($attendance) {
            $latestRest = $attendance->rests()->whereNull('end_time')->latest()->first();
            if ($latestRest) {
                $latestRest->update([
                    'end_time' => Carbon::now(),
                ]);
            }
        }
    }

    /**
     * 現在進行中の勤怠記録を取得する内部ヘルパー
     */
    private function getWorkingAttendance(User $user): ?Attendance
    {
        return Attendance::where('user_id', $user->id)
            ->whereDate('work_date', Carbon::today())
            ->whereNull('end_time')
            ->first();
    }
}
