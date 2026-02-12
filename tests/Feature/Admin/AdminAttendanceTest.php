<?php

namespace Tests\Feature\Admin;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * 管理者用勤怠管理機能のテスト (US010, US011 対応)
 */
class AdminAttendanceTest extends TestCase
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
    public function 管理者は全ユーザーの日次勤怠一覧を閲覧できる()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $user1 = User::factory()->create(['name' => 'ユーザー1']);
        $user2 = User::factory()->create(['name' => 'ユーザー2']);

        // Factory を使用して fillable を回避し、created_at を確実に操作
        Attendance::factory()->create([
            'user_id' => $user1->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 09:00:00',
            'created_at' => now()->subHour(),
        ]);

        Attendance::factory()->create([
            'user_id' => $user2->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 10:00:00',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.attendance.index'));

        $response->assertStatus(200);

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Admin/Attendance/Index')
                ->has('attendances', 2)
                ->where('attendances.0.user.name', 'ユーザー2')
                ->where('attendances.1.user.name', 'ユーザー1')
        );
    }

    /** @test */
    public function 管理者は勤怠詳細を直接修正できる()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);
        /** @var User $user */
        $user = User::factory()->create();

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
            'end_time' => '2026-02-10 18:00:00',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.attendance.update', $attendance->id), [
            'requested_start_time' => '09:15',
            'requested_end_time' => '18:15',
            'reason' => '管理者による直接修正',
            'rests' => [],
        ]);

        $response->assertRedirect();

        // 直接修正なので、申請テーブルではなく attendance テーブル自体が更新される
        $this->assertDatabaseHas('attendances', [
            'id' => $attendance->id,
            'start_time' => '2026-02-10 09:15:00',
            'end_time' => '2026-02-10 18:15:00',
        ]);
    }

    /** @test */
    public function 日付切り替えナビゲーションが正しく機能する()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        // 前日のデータを確認
        $response = $this->actingAs($admin)->get(route('admin.attendance.index', ['date' => '2026-02-11']));

        $response->assertInertia(
            fn(Assert $page) => $page
                ->where('navigation.date', '2026-02-11')
                ->where('navigation.prevDate', '2026-02-10')
                ->where('navigation.nextDate', '2026-02-12')
        );
    }
}
