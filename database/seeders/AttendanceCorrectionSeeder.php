<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceCorrectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('is_admin', false)->get();

        foreach ($users as $user) {
            // 各ユーザーの直近1ヶ月の勤怠を取得
            $attendances = Attendance::where('user_id', $user->id)
                ->where('work_date', '>=', Carbon::now()->subMonth()->startOfMonth())
                ->get();

            foreach ($attendances as $attendance) {
                // test4 ユーザーの昨日のデータは E2Eテスト用にクリーンに保つ
                if ($user->email === 'test4@example.com' && $attendance->work_date->isYesterday()) {
                    continue;
                }

                // 約10%の確率で修正申請を生成
                if (rand(0, 9) === 0) {
                    AttendanceCorrection::factory()
                        ->for($attendance)
                        ->withRests(rand(0, 1)) // 0〜1件の休憩修正を伴う
                        ->create();
                }
            }
        }
    }
}
