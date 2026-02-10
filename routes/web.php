<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ルートURL: 認証状態でリダイレクト先を振り分け
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('attendance');
    }
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// 打刻関連 (認証必須)
Route::middleware(['auth'])->group(function () {
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
    Route::get('/login', [\App\Http\Controllers\Admin\LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [\App\Http\Controllers\Admin\LoginController::class, 'login']);
    Route::post('/logout', [\App\Http\Controllers\Admin\LoginController::class, 'logout'])->name('logout');

    // 管理者専用機能 (認証および管理者権限必須)
    Route::middleware(['auth', 'is_admin'])->group(function () {
        // 日次勤怠一覧ページ (US010)
        Route::get('/attendance/list', [\App\Http\Controllers\Admin\AttendanceController::class, 'index'])->name('attendance.index');
        // 勤怠詳細ページ (US011)
        Route::get('/attendance/{attendance}', [\App\Http\Controllers\Admin\AttendanceController::class, 'show'])->name('attendance.show');
        // 勤怠情報更新 (管理者直接修正 FN040)
        Route::put('/attendance/{attendance}', [\App\Http\Controllers\Admin\AttendanceController::class, 'update'])->name('attendance.update');
    });
});
