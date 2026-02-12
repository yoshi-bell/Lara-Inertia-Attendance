<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function ログイン画面が表示される(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    /** @test */
    public function メールアドレスが未入力の場合_バリデーションメッセージが表示される()
    {
        $response = $this->post('/login', [
            'email' => '',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors(['email' => 'メールアドレスを入力してください']);
    }

    /** @test */
    public function パスワードが未入力の場合_バリデーションメッセージが表示される()
    {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['password' => 'パスワードを入力してください']);
    }

    /** @test */
    public function 登録内容と一致しない場合_バリデーションメッセージが表示される()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors(['email' => 'ログイン情報が登録されていません']);
    }

    /** @test */
    public function 正しい情報が入力された場合_ログイン処理が実行される()
    {
        /** @var User $user */
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);

        // リダイレクト先は一元管理設定に従う
        $response->assertRedirect(route(config('project.home_route'), absolute: false));
    }

    /** @test */
    public function ログアウト処理が正常に実行される(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
