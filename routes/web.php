<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Admin\LoginController as AdminLoginController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use Illuminate\Support\Facades\Route;

// ルートURL: 認証状態でリダイレクト先を振り分け
Route::get('/', function () {
    if (auth()->check()) {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        return $user->is_admin
            ? redirect()->route('admin.attendance.index')
            : redirect()->route('attendance');
    }
    return redirect()->route('login');
});

// 一般ユーザー用ルート (認証・メール認証必須・一般ユーザーのみ)
Route::middleware(['auth', 'verified', 'general_user'])->group(function () {
    // 勤怠打刻ページ
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance');
    // 勤怠一覧ページ
    Route::get('/attendance/list', [AttendanceController::class, 'list'])->name('attendance.list');
    // 勤怠詳細ページ (設計書通り /attendance/detail/{id})
    Route::get('/attendance/detail/{attendance}', [AttendanceController::class, 'show'])->name('attendance.detail');
    // 修正申請の保存 (旧プロジェクト通り /attendances/correction/{id})
    Route::post('/attendances/correction/{attendance}', [AttendanceController::class, 'storeCorrection'])->name('attendances.correction.store');
    // 修正申請一覧ページ (設計書通り /stamp_correction_request/list)
    Route::get('/stamp_correction_request/list', [AttendanceController::class, 'correctionList'])->name('corrections.index');

    // 打刻アクション
    Route::post('/attendance/start', [AttendanceController::class, 'startWork'])->name('attendance.start');
    Route::post('/attendance/end', [AttendanceController::class, 'endWork'])->name('attendance.end');
    Route::post('/rest/start', [AttendanceController::class, 'startRest'])->name('rest.start');
    Route::post('/rest/end', [AttendanceController::class, 'endRest'])->name('rest.end');
});

// プロフィール関連
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

// 管理者用認証ルート
Route::prefix('admin')->name('admin.')->group(function () {

    // ゲスト専用 (未ログイン時のみアクセス可能)
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AdminLoginController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [AdminLoginController::class, 'login']);
    });

    // 管理者専用機能 (認証および管理者権限必須)
    Route::middleware(['auth', 'is_admin'])->group(function () {
        // ログアウト処理
        Route::post('/logout', [AdminLoginController::class, 'logout'])->name('logout');

        // 日次勤怠一覧ページ (US010)
        Route::get('/attendance/list', [AdminAttendanceController::class, 'index'])->name('attendance.index');
        // 勤怠詳細ページ (US011)
        Route::get('/attendance/{attendance}', [AdminAttendanceController::class, 'show'])->name('attendance.show');
        // 勤怠情報更新 (管理者直接修正 FN040)
        Route::put('/attendance/{attendance}', [AdminAttendanceController::class, 'update'])->name('attendance.update');
    });
});
