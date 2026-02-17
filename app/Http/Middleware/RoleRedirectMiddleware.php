<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

/**
 * ログイン済みユーザーを役割に応じて適切な HOME へリダイレクトさせる
 */
class RoleRedirectMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ログインしている場合
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();

            if ($user->is_admin) {
                // 管理者の場合は管理画面のトップへ
                return redirect()->route('admin.attendance.index');
            } else {
                // 一般ユーザーの場合は打刻画面へ
                return redirect()->route('attendance');
            }
        }

        return $next($request);
    }
}
