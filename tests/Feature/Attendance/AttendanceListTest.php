<?php

namespace Tests\Feature\Attendance;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * 勤怠一覧機能のテスト (US007 対応)
 */
class AttendanceListTest extends TestCase
{
    use RefreshDatabase;

    /**
     * テスト開始前の共通設定
     */
    protected function setUp(): void
    {
        parent::setUp();
        // 全てのテストを「2026年2月15日」の世界線で実行する
        Carbon::setTestNow(Carbon::create(2026, 2, 15, 10, 0, 0));
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
    public function 自分が行った勤怠情報が全て表示されている()
    {
        /** @var User $user */
        $user = User::factory()->create();

        // 自分の勤怠データを作成 (12日分として作成)
        Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 09:00:00',
            'end_time' => '2026-02-12 18:00:00',
        ]);

        // 他のユーザーのデータ (これが見えないことを確認)
        $otherUser = User::factory()->create();
        Attendance::create([
            'user_id' => $otherUser->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 10:00:00',
        ]);

        $response = $this->actingAs($user)->get(route('attendance.list', ['month' => '2026-02']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Attendance/List')
            ->has('calendarData.11', fn (Assert $day) => $day
                ->where('date', '02/12(木)')
                ->where('attendance.user_id', $user->id) // 絶対に自分のIDであることの証明
                ->where('attendance.start_time_hi', '09:00')
                ->where('attendance.end_time_hi', '18:00')
                ->etc()
            )
        );
    }

    /** @test */
    public function 勤怠一覧画面に遷移した際に現在の月が表示される()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('attendance.list'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('navigation.currentMonth', '2026年02月')
        );
    }

    /** @test */
    public function 「前月」の情報を表示できる()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('attendance.list', ['month' => '2026-01']));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('navigation.currentMonth', '2026年01月')
            ->where('navigation.prevMonth', '2025-12')
            ->where('navigation.nextMonth', '2026-02')
        );
    }

    /** @test */
    public function 「翌月」の情報を表示できる()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('attendance.list', ['month' => '2026-03']));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('navigation.currentMonth', '2026年03月')
            ->where('navigation.prevMonth', '2026-02')
            ->where('navigation.nextMonth', '2026-04')
        );
    }

    /** @test */
    public function 詳細をクリックすると_勤怠詳細画面に遷移する()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 09:00:00',
        ]);

        $response = $this->actingAs($user)->get(route('attendance.detail', $attendance->id));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Attendance/Detail')
            ->where('attendance.id', $attendance->id)
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
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 09:00:00',
        ]);

        // 他人のデータを見に行こうとすると 403 (Forbidden) または 404 になるべき
        $response = $this->actingAs($user)->get(route('attendance.detail', $otherAttendance->id));

        $response->assertStatus(403);
    }
}
