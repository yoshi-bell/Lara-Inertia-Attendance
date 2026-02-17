<?php

namespace Database\Factories;

use App\Models\Rest;
use App\Models\Attendance;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rest>
 */
class RestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 休憩開始時刻を12:01〜12:05の間に設定
        $startTime = Carbon::today()->setTime(12, rand(1, 5), rand(0, 59));

        // 休憩終了時刻を12:55〜12:59の間に設定
        $endTime = Carbon::today()->setTime(12, rand(55, 59), rand(0, 59));

        return [
            'attendance_id' => Attendance::factory(),
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];
    }
}
