<?php

namespace Database\Factories;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 旧プロジェクトのロジック: 今月のランダムな日、9時台出勤、9時間拘束
        $workDate = $this->faker->dateTimeThisMonth();
        $startTime = Carbon::instance($workDate)->setTime(9, rand(0, 59));
        $endTime = $startTime->copy()->addHours(9);

        return [
            'user_id' => User::factory(),
            'work_date' => $startTime->toDateString(),
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }
}
