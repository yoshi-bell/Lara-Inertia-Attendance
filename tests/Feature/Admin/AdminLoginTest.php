<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * 管理者ログイン機能のテスト (US004 対応)
 */
class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function 管理者ログイン画面が表示される()
    {
        $response = $this->get(route('admin.login'));

        $response->assertStatus(200);

        // 正しい React コンポーネントが呼ばれているかチェック
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Login')
        );
    }

    /** @test */
    public function 正しい情報で管理者ログインができる()
    {
        /** @var User $admin */
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('adminpass'),
            'is_admin' => true,
        ]);

        $response = $this->post(route('admin.login'), [
            'email' => 'admin@example.com',
            'password' => 'adminpass',
        ]);

        $this->assertAuthenticatedAs($admin);

        // 管理者用ホームページへリダイレクト
        $response->assertRedirect(route('admin.attendance.index'));
    }

    /** @test */
    public function 一般ユーザーは管理者ログインができない()
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('usertest'),
            'is_admin' => false, // 一般ユーザー
        ]);

        $response = $this->post(route('admin.login'), [
            'email' => 'user@example.com',
            'password' => 'usertest',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function 管理者ログイン時のバリデーションメッセージが表示される()
    {
        $response = $this->post(route('admin.login'), [
            'email' => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors([
            'email' => 'メールアドレスを入力してください',
            'password' => 'パスワードを入力してください',
        ]);
    }
}
