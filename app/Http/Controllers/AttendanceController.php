<?php

namespace App\Http\Controllers;

use App\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    private AttendanceService $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * 打刻画面を表示する
     */
    public function index(): Response
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        return Inertia::render('Attendance/Index', [
            'attendanceStatus' => $this->attendanceService->getCurrentStatus($user),
        ]);
    }

    /**
     * 出勤
     */
    public function startWork(): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $this->attendanceService->startWork($user);
        return redirect()->route('attendance');
    }

    /**
     * 退勤
     */
    public function endWork(): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $this->attendanceService->endWork($user);
        return redirect()->route('attendance');
    }

    /**
     * 休憩開始
     */
    public function startRest(): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $this->attendanceService->startRest($user);
        return redirect()->route('attendance');
    }

    /**
     * 休憩戻り
     */
    public function endRest(): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $this->attendanceService->endRest($user);
        return redirect()->route('attendance');
    }
}
