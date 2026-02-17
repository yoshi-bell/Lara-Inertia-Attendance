<?php

namespace Database\Factories;

use App\Models\AttendanceCorrection;
use App\Models\Attendance;
use App\Models\User;
use App\Models\RestCorrection;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AttendanceCorrection>
 */
class AttendanceCorrectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 旧プロジェクトの定義を再現
        return [
            'reason' => '遅延のため',
            'status' => $this->faker->randomElement(['pending', 'approved']),
        ];
    }

    /**
     * ファクトリの構成: 作成後の連動ロジック (旧プロジェクトの完全移植)
     */
    public function configure(): static
    {
        return $this->afterMaking(function (AttendanceCorrection $correction) {
            // for() などで Attendance が指定された際、そのコンテキストに合わせたデータを自動設定
            if ($correction->attendance_id) {
                $attendance = $correction->attendance;
                $correction->requester_id ??= $attendance->user_id;
                
                // 元の勤怠時間から前後10分の範囲でランダムに「修正希望時間」を生成
                $correction->requested_start_time ??= $attendance->start_time->copy()->addMinutes(rand(-10, 10));
                $correction->requested_end_time ??= $attendance->end_time->copy()->addMinutes(rand(-10, 10));
                
                // 作成日は、勤怠の日付から「今日」までの間のランダムな日
                $createdAt = $this->faker->dateTimeBetween($attendance->work_date, 'now');
                $correction->created_at = $createdAt;
                $correction->updated_at = $createdAt;
            }
        })->afterCreating(function (AttendanceCorrection $correction) {
            // 承認済みの申請が作成された場合、実際の勤怠データも更新する
            if ($correction->status === 'approved') {
                $attendance = $correction->attendance;
                $attendance->start_time = $correction->requested_start_time;
                $attendance->end_time = $correction->requested_end_time;
                $attendance->save();

                // 休憩データも同様に更新（既存を消して新しく作る）
                $attendance->rests()->delete();
                foreach ($correction->restCorrections as $restCorrection) {
                    $attendance->rests()->create([
                        'start_time' => $restCorrection->requested_start_time,
                        'end_time' => $restCorrection->requested_end_time,
                    ]);
                }
            }
        });
    }

    /**
     * 休憩修正を付随させる
     */
    public function withRests(int $count = 1): static
    {
        return $this->has(
            RestCorrection::factory()->count($count),
            'restCorrections'
        );
    }
}
