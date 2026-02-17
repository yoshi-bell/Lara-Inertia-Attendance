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
        // 1. 未ログインの場合は管理者ログイン画面へリダイレクト
        if (!Auth::check()) {
            return redirect()->route('admin.login');
        }

        // 2. ログイン済みだが管理者でない場合は 403 Forbidden
        if (!Auth::user()->is_admin) {
            abort(403);
        }

        return $next($request);
    }
}
