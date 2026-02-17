<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * 一般ユーザー権限チェックミドルウェア
 * 管理者のアクセスを拒否し、管理者用トップページへリダイレクトする
 */
class GeneralUserMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 未ログイン、または管理者である場合はアクセス拒否
        if (! Auth::check() || Auth::user()->is_admin) {
            if (Auth::user()?->is_admin) {
                // 管理者が迷い込んだ場合は管理者トップへ
                return redirect()->route('admin.attendance.index');
            }

            // 未ログインならログイン画面へ
            return redirect()->route('login');
        }

        return $next($request);
    }
}
