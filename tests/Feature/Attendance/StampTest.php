<?php

namespace Tests\Feature\Attendance;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * 勤怠打刻機能のテスト (US006, US007 対応)
 */
class StampTest extends TestCase
{
    use RefreshDatabase;

    /**
     * テスト終了後の後処理
     */
    protected function tearDown(): void
    {
        // 止めていた時刻を現在時刻に戻す (副作用の防止)
        Carbon::setTestNow();
        parent::tearDown();
    }

    /** @test */
    public function 勤務外の場合_勤怠ステータスが正しく表示される()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('attendance'))->assertInertia(
            fn (Assert $page) => $page
                ->component('Attendance/Index')
                ->where('attendanceStatus.statusText', '勤務外')
                ->where('attendanceStatus.isWorking', false)
                ->where('attendanceStatus.isOnBreak', false)
                ->where('attendanceStatus.hasFinishedWork', false)
        );
    }

    /** @test */
    public function 出勤ボタンが正しく機能する()
    {
        Carbon::setTestNow(Carbon::create(2026, 2, 12, 9, 0, 0));
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('attendance.start'));

        $this->assertDatabaseHas('attendances', [
            'user_id' => $user->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 09:00:00',
        ]);

        $response->assertRedirect(route('attendance'));

        $this->get(route('attendance'))->assertInertia(
            fn (Assert $page) => $page
                ->where('attendanceStatus.statusText', '勤務中')
                ->where('attendanceStatus.isWorking', true)
        );
    }

    /** @test */
    public function 退勤ボタンが正しく機能する()
    {
        Carbon::setTestNow(Carbon::create(2026, 2, 12, 9, 0, 0));
        /** @var User $user */
        $user = User::factory()->create();

        Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-12',
            'start_time' => now(),
        ]);

        Carbon::setTestNow(Carbon::create(2026, 2, 12, 18, 0, 0));
        $response = $this->actingAs($user)->post(route('attendance.end'));

        $this->assertDatabaseHas('attendances', [
            'end_time' => '2026-02-12 18:00:00',
        ]);

        $response->assertRedirect(route('attendance'));

        $this->get(route('attendance'))->assertInertia(
            fn (Assert $page) => $page
                ->where('attendanceStatus.statusText', '勤務終了')
                ->where('attendanceStatus.hasFinishedWork', true)
        );
    }

    /** @test */
    public function 休憩ボタンが正しく機能する()
    {
        Carbon::setTestNow(Carbon::create(2026, 2, 12, 9, 0, 0));
        /** @var User $user */
        $user = User::factory()->create();

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-12',
            'start_time' => now(),
        ]);

        Carbon::setTestNow(Carbon::create(2026, 2, 12, 12, 0, 0));
        $response = $this->actingAs($user)->post(route('rest.start'));

        $this->assertDatabaseHas('rests', [
            'attendance_id' => $attendance->id,
            'start_time' => '2026-02-12 12:00:00',
        ]);

        $response->assertRedirect(route('attendance'));

        $this->get(route('attendance'))->assertInertia(
            fn (Assert $page) => $page
                ->where('attendanceStatus.statusText', '休憩中')
                ->where('attendanceStatus.isOnBreak', true)
        );
    }

    /** @test */
    public function 休憩戻ボタンが正しく機能する()
    {
        Carbon::setTestNow(Carbon::create(2026, 2, 12, 9, 0, 0));
        /** @var User $user */
        $user = User::factory()->create();

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-12',
            'start_time' => now(),
        ]);

        $rest = $attendance->rests()->create([
            'start_time' => Carbon::create(2026, 2, 12, 12, 0, 0),
        ]);

        Carbon::setTestNow(Carbon::create(2026, 2, 12, 13, 0, 0));
        $response = $this->actingAs($user)->post(route('rest.end'));

        $this->assertDatabaseHas('rests', [
            'id' => $rest->id,
            'end_time' => '2026-02-12 13:00:00',
        ]);

        $response->assertRedirect(route('attendance'));

        $this->get(route('attendance'))->assertInertia(
            fn (Assert $page) => $page
                ->where('attendanceStatus.statusText', '勤務中')
                ->where('attendanceStatus.isOnBreak', false)
        );
    }

    /** @test */
    public function 打刻時刻が勤怠一覧画面で確認できる()
    {
        Carbon::setTestNow(Carbon::create(2026, 2, 12, 9, 0, 0));
        /** @var User $user */
        $user = User::factory()->create();

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 09:30:00',
            'end_time' => '2026-02-12 18:30:00',
        ]);

        $attendance->rests()->create([
            'start_time' => '2026-02-12 12:00:00',
            'end_time' => '2026-02-12 13:00:00',
        ]);

        $response = $this->actingAs($user)->get(route('attendance.list', ['month' => '2026-02']));

        $response->assertStatus(200);

        // 修正: has() を用いて、配列内の特定の要素を安全かつ詳細に検証
        $response->assertInertia(
            fn (Assert $page) => $page
                ->has(
                    'calendarData.11',
                    fn (Assert $day) => $day // 12日はインデックス11
                        ->where('date', '02/12(木)')
                        ->where('attendance.start_time_hi', '09:30')
                        ->where('attendance.end_time_hi', '18:30')
                        ->where('attendance.total_rest_time', '1:00')
                        ->where('attendance.work_time', '8:00')
                        ->etc()
                )
        );
    }
}
