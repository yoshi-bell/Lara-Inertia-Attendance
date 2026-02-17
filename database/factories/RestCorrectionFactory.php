<?php

namespace Database\Factories;

use App\Models\RestCorrection;
use App\Models\AttendanceCorrection;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RestCorrection>
 */
class RestCorrectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // デフォルトでは仮の時間を生成。親のコンテキストに依存する場合は configure 等で調整可能
        return [
            'attendance_correction_id' => AttendanceCorrection::factory(),
            'requested_start_time' => now()->setTime(12, 0),
            'requested_end_time' => now()->setTime(13, 0),
        ];
    }
}