<?php

namespace App\Http\Controllers;

use App\Services\AttendanceService;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    private AttendanceService $attendanceService;
    private CalendarService $calendarService;
    private \App\Services\CorrectionService $correctionService;

    public function __construct(
        AttendanceService $attendanceService,
        CalendarService $calendarService,
        \App\Services\CorrectionService $correctionService
    ) {
        $this->attendanceService = $attendanceService;
        $this->calendarService = $calendarService;
        $this->correctionService = $correctionService;
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
     * 勤怠一覧ページを表示する
     */
    public function list(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 表示対象の月を取得 (デフォルトは今月)
        $monthStr = $request->input('month', Carbon::now()->format('Y-m'));
        $currentDate = Carbon::parse($monthStr)->startOfMonth();

        return Inertia::render('Attendance/List', [
            'calendarData' => $this->calendarService->generate($user, $currentDate),
            'navigation' => [
                'currentMonth' => $currentDate->format('Y年m月'),
                'prevMonth' => $currentDate->copy()->subMonth()->format('Y-m'),
                'nextMonth' => $currentDate->copy()->addMonth()->format('Y-m'),
            ],
        ]);
    }

    /**
     * 勤怠詳細ページを表示する
     */
    public function show(\App\Models\Attendance $attendance): Response
    {
        $attendance->load([
            'user:id,name',
            'rests',
            'corrections' => function ($query) {
                $query->where('status', 'pending')->with('restCorrections')->latest();
            }
        ]);

        return Inertia::render('Attendance/Detail', [
            'attendance' => $attendance,
            'pendingCorrection' => $attendance->corrections->first(),
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

    /**
     * 修正申請を保存する
     */
    public function storeCorrection(
        \App\Http\Requests\AttendanceCorrectionRequest $request,
        \App\Models\Attendance $attendance
    ): RedirectResponse {
        $this->correctionService->storeRequest($request->validated(), $attendance);

        return redirect()->route('attendance.list')
            ->with('success', '修正申請を送信しました。承認をお待ちください。');
    }
}
