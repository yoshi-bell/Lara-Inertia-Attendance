<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * 管理者権限チェックミドルウェア
 */
class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 未ログイン、または管理者フラグが false の場合はアクセス拒否
        if (!Auth::check() || !Auth::user()->is_admin) {
            // 管理者ログイン画面へリダイレクト
            return redirect()->route('admin.login');
        }

        return $next($request);
    }
}
