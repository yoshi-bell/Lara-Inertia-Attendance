<?php

namespace Tests\Unit\Models;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Attendance モデルのビジネスロジックテスト
 * 主に is_editable 属性の判定アルゴリズム（日またぎ対応）を検証する
 */
class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow(); // テスト終了後に時刻固定を解除
        parent::tearDown();
    }

    /** @test */
    public function 通常勤務中は修正不可()
    {
        // 2/12 10:00 出勤
        $attendance = Attendance::factory()->create([
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 10:00:00',
            'end_time' => null,
        ]);

        // 現在時刻: 2/12 14:00 (当日勤務中)
        Carbon::setTestNow('2026-02-12 14:00:00');
        $this->assertFalse($attendance->fresh()->is_editable);
    }

    /** @test */
    public function 退勤済みであれば当日でも修正可能()
    {
        // 2/12 10:00 出勤 -> 18:00 退勤
        $attendance = Attendance::factory()->create([
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 10:00:00',
            'end_time' => '2026-02-12 18:00:00',
        ]);

        // 現在時刻: 2/12 19:00 (当日だが退勤済み)
        Carbon::setTestNow('2026-02-12 19:00:00');
        $this->assertTrue($attendance->fresh()->is_editable);
    }

    /** @test */
    public function 深夜残業中はカレンダー上の日付が変わっても修正不可()
    {
        // 2/12 22:00 出勤 (未退勤)
        $attendance = Attendance::factory()->create([
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 22:00:00',
            'end_time' => null,
        ]);

        // 現在時刻: 2/13 04:59 (翌日だが業務上の日付はまだ 2/12)
        Carbon::setTestNow('2026-02-13 04:59:59');
        $this->assertFalse($attendance->fresh()->is_editable);
    }

    /** @test */
    public function 業務日付の切り替わり時刻を過ぎれば退勤忘れとして修正可能になる()
    {
        // 2/12 22:00 出勤 (未退勤)
        $attendance = Attendance::factory()->create([
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 22:00:00',
            'end_time' => null,
        ]);

        // 現在時刻: 2/13 05:00 (業務日付が 2/13 に切り替わった)
        Carbon::setTestNow('2026-02-13 05:00:00');
        $this->assertTrue($attendance->fresh()->is_editable);
    }

    /** @test */
    public function 完全に過去のデータは未退勤でも修正可能()
    {
        // 2/10 の記録 (退勤なし)
        $attendance = Attendance::factory()->create([
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
            'end_time' => null,
        ]);

        // 現在時刻: 2/13 10:00
        Carbon::setTestNow('2026-02-13 10:00:00');
        $this->assertTrue($attendance->fresh()->is_editable);
    }
}
