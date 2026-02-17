<?php

namespace Tests\Feature\Attendance;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * 勤怠詳細・修正申請機能のテスト (US008 対応)
 */
class AttendanceDetailTest extends TestCase
{
    use RefreshDatabase;

    /**
     * テスト開始前の共通設定
     */
    protected function setUp(): void
    {
        parent::setUp();
        // 全てのテストを「2026年2月12日」の世界線で実行する
        Carbon::setTestNow(Carbon::create(2026, 2, 12, 10, 0, 0));
    }

    /**
     * テスト終了後の後処理
     */
    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /** @test */
    public function 勤怠詳細画面が表示され、正しいデータが渡されている()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
            'end_time' => '2026-02-10 18:00:00',
        ]);

        $response = $this->actingAs($user)->get(route('attendance.detail', $attendance->id));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Attendance/Detail')
            ->where('attendance.user.name', $user->name)
            ->where('attendance.start_time_hi', '09:00')
            ->where('attendance.end_time_hi', '18:00')
        );
    }

    /** @test */
    public function 他人の勤怠詳細は閲覧できない()
    {
        /** @var User $user */
        $user = User::factory()->create();
        /** @var User $otherUser */
        $otherUser = User::factory()->create();
        $otherAttendance = Attendance::create([
            'user_id' => $otherUser->id,
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
        ]);

        // 自分以外のデータにアクセスしようとすると 403 Forbidden になるべき
        $response = $this->actingAs($user)->get(route('attendance.detail', $otherAttendance->id));

        $response->assertStatus(403);
    }

    /** @test */
    public function 備考欄が未入力の場合_バリデーションメッセージが表示される()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
            'end_time' => '2026-02-10 18:00:00',
        ]);

        $response = $this->actingAs($user)->post(route('attendances.correction.store', $attendance->id), [
            'requested_start_time' => '09:00',
            'requested_end_time' => '18:00',
            'reason' => '', // 未入力
            'rests' => [],
        ]);

        $response->assertSessionHasErrors(['reason' => '備考を記入してください']);
    }

    /** @test */
    public function 出勤時間が退勤時間より後になっている場合_エラーメッセージが表示される()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
            'end_time' => '2026-02-10 18:00:00',
        ]);

        $response = $this->actingAs($user)->post(route('attendances.correction.store', $attendance->id), [
            'requested_start_time' => '18:00',
            'requested_end_time' => '09:00', // 不整合
            'reason' => 'テスト理由',
            'rests' => [],
        ]);

        $response->assertSessionHasErrors(['requested_end_time' => '出勤時間もしくは退勤時間が不適切な値です']);
    }

    /** @test */
    public function 修正申請が正常に処理される()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
            'end_time' => '2026-02-10 18:00:00',
        ]);

        $validData = [
            'requested_start_time' => '09:30',
            'requested_end_time' => '18:30',
            'reason' => '電車遅延のため',
            'rests' => [],
        ];

        $response = $this->actingAs($user)->post(route('attendances.correction.store', $attendance->id), $validData);

        $response->assertRedirect();
        $this->assertDatabaseHas('attendance_corrections', [
            'attendance_id' => $attendance->id,
            'requester_id' => $user->id,
            'reason' => '電車遅延のため',
            'status' => 'pending',
        ]);
    }
}
