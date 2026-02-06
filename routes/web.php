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

require __DIR__.'/auth.php';
