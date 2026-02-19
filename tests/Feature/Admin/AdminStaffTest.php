<?php

namespace Tests\Feature\Admin;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * スタッフ管理機能のテスト (US012, US013 対応)
 */
class AdminStaffTest extends TestCase
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
    public function 管理者はスタッフ一覧を閲覧できる()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        // スタッフを2名作成 (ID昇順での並びを検証するため、この順序で作成)
        User::factory()->create(['name' => 'テストスタッフ1', 'is_admin' => false]);
        User::factory()->create(['name' => 'テストスタッフ2', 'is_admin' => false]);

        $response = $this->actingAs($admin)->get(route('admin.staff.list'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Admin/Staff/List')
                ->has('staffs', 2)
                ->where('staffs.0.name', 'テストスタッフ1') // ID昇順仕様の確認
                ->where('staffs.1.name', 'テストスタッフ2')
        );
    }

    /** @test */
    public function 一般ユーザーはスタッフ一覧を閲覧できない()
    {
        /** @var User $user */
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get(route('admin.staff.list'));

        // 認可ガードによって 403 Forbidden になることを検証
        $response->assertStatus(403);
    }

    /** @test */
    public function 管理者はスタッフ別の月次勤怠を閲覧できる()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);
        /** @var User $staff */
        $staff = User::factory()->create(['name' => '佐藤太郎', 'is_admin' => false]);

        // 佐藤太郎さんの12日のデータを作成
        Attendance::factory()->create([
            'user_id' => $staff->id,
            'work_date' => '2026-02-12',
            'start_time' => '2026-02-12 09:00:00',
            'end_time' => '2026-02-12 18:00:00',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.staff.attendance.show', $staff->id));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Admin/Staff/AttendanceList')
                ->where('staff.name', '佐藤太郎')
                ->has(
                    'calendarData.11',
                    fn (Assert $day) => $day
                        ->where('date', '02/12(木)')
                        ->where('attendance.start_time_hi', '09:00')
                        ->where('attendance.end_time_hi', '18:00')
                        ->etc()
                )
        );
    }

    /** @test */
    public function スタッフ別月次勤怠のナビゲーションが正しく機能する()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);
        /** @var User $staff */
        $staff = User::factory()->create(['is_admin' => false]);

        // 1月のデータを取得
        $response = $this->actingAs($admin)->get(route('admin.staff.attendance.show', [
            'user' => $staff->id,
            'month' => '2026-01',
        ]));

        $response->assertInertia(
            fn (Assert $page) => $page
                ->where('navigation.currentMonth', '2026年01月')
                ->where('navigation.prevMonth', '2025-12')
                ->where('navigation.nextMonth', '2026-02')
        );
    }
}
