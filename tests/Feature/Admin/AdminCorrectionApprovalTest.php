<?php

namespace Tests\Feature\Admin;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * 修正申請承認フローのテスト (US014, US015 対応)
 */
class AdminCorrectionApprovalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * テスト開始前の共通設定
     */
    protected function setUp(): void
    {
        parent::setUp();
        // 全てのテストを一定の世界線で実行
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
    public function 管理者は全ユーザーの修正申請一覧を閲覧できる()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);
        /** @var User $user */
        $user = User::factory()->create(['name' => '申請ユーザー']);

        // 勤怠データとそれに対する修正申請を作成
        $attendance = Attendance::factory()->create([
            'user_id' => $user->id,
            'work_date' => '2026-02-10',
        ]);

        AttendanceCorrection::create([
            'attendance_id' => $attendance->id,
            'requester_id' => $user->id,
            'requested_start_time' => '2026-02-10 09:30:00',
            'requested_end_time' => '2026-02-10 18:30:00',
            'reason' => '修正理由のテスト',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.corrections.index', ['status' => 'pending']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/CorrectionRequest/List')
            ->has('corrections', 1)
            ->where('corrections.0.requester.name', '申請ユーザー')
            ->where('corrections.0.reason', '修正理由のテスト')
        );
    }

    /** @test */
    public function 管理者は申請を承認し勤怠データを更新できる()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);
        /** @var User $user */
        $user = User::factory()->create();

        // 修正前の勤怠データ
        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => '2026-02-10',
            'start_time' => '2026-02-10 09:00:00',
            'end_time' => '2026-02-10 18:00:00',
        ]);

        // 修正申請データ
        $correction = AttendanceCorrection::create([
            'attendance_id' => $attendance->id,
            'requester_id' => $user->id,
            'requested_start_time' => '2026-02-10 09:30:00',
            'requested_end_time' => '2026-02-10 18:30:00',
            'reason' => '修正承認テスト',
            'status' => 'pending',
        ]);

        // 承認アクションを実行
        $response = $this->actingAs($admin)->post(route('admin.corrections.approve', $correction->id));

        $response->assertRedirect();

        // 検証1: 勤怠本体（attendance テーブル）が申請内容で更新されていること
        $this->assertDatabaseHas('attendances', [
            'id' => $attendance->id,
            'start_time' => '2026-02-10 09:30:00',
            'end_time' => '2026-02-10 18:30:00',
        ]);

        // 検証2: 申請ステータスが approved になっていること
        $this->assertEquals('approved', $correction->fresh()->status);
    }

    /** @test */
    public function 一般ユーザーは修正申請を承認できない()
    {
        /** @var User $user */
        $user = User::factory()->create(['is_admin' => false]);

        // 誰かの申請データを用意
        $attendance = Attendance::factory()->create(['work_date' => '2026-02-10']);
        $correction = AttendanceCorrection::create([
            'attendance_id' => $attendance->id,
            'requester_id' => $attendance->user_id,
            'requested_start_time' => '2026-02-10 09:30:00',
            'requested_end_time' => '2026-02-10 18:30:00',
            'reason' => '不正操作テスト',
            'status' => 'pending',
        ]);

        // 一般ユーザーとして管理者の承認エンドポイントに POST を試みる
        $response = $this->actingAs($user)->post(route('admin.corrections.approve', $correction->id));

        // 403 Forbidden で弾かれるべき
        $response->assertStatus(403);

        // データが書き換わっていない（pending のまま）ことを確認
        $this->assertEquals('pending', $correction->fresh()->status);
    }
}
