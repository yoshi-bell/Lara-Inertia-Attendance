<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * 管理者ログイン用コントローラー
 */
class LoginController extends Controller
{
    /**
     * ログイン画面を表示する
     */
    public function showLoginForm(): Response
    {
        return Inertia::render('Admin/Login');
    }

    /**
     * ログイン処理を実行する
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        // LoginRequest により email と password のバリデーションは完了済み
        $credentials = $request->only('email', 'password');

        // 認証試行
        if (Auth::attempt($credentials)) {
            /** @var User $user */
            $user = Auth::user();

            // 管理者フラグのチェック
            if ($user && $user->is_admin) {
                $request->session()->regenerate();

                // 日次勤怠一覧（Phase 4 のメイン画面）へリダイレクト
                return redirect()->intended(route('admin.attendance.index'));
            }

            // 管理者でない場合は即ログアウトしてエラー
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // 認証失敗または管理者でない場合のエラーメッセージ (FN016)
        throw ValidationException::withMessages([
            'email' => 'ログイン情報が登録されていません',
        ]);
    }

    /**
     * ログアウト処理
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
