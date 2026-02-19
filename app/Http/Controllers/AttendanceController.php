<?php

namespace App\Http\Controllers;

use App\Data\AttendanceData;
use App\Http\Requests\AttendanceCorrectionRequest;
use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\User;
use App\Services\AttendanceService;
use App\Services\CalendarService;
use App\Services\CorrectionService;
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

    private CorrectionService $correctionService;

    public function __construct(
        AttendanceService $attendanceService,
        CalendarService $calendarService,
        CorrectionService $correctionService
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
        /** @var User $user */
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
        /** @var User $user */
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

    public function show(Attendance $attendance): Response
    {
        // 認可チェック: 自分のデータでない場合は 403 を返す
        if ($attendance->user_id !== Auth::id()) {
            abort(403);
        }

        $attendance->load([
            'user',
            'rests',
            'corrections' => function ($query) {
                $query->where('status', 'pending')->with('restCorrections')->latest();
            },
        ]);

        return Inertia::render('Attendance/Detail', [
            'attendance' => AttendanceData::from($attendance),
            'pendingCorrection' => $attendance->corrections->first(),
        ]);
    }

    /**
     * 出勤
     */
    public function startWork(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $this->attendanceService->startWork($user);

        return redirect()->route('attendance');
    }

    /**
     * 退勤
     */
    public function endWork(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $this->attendanceService->endWork($user);

        return redirect()->route('attendance');
    }

    /**
     * 休憩開始
     */
    public function startRest(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $this->attendanceService->startRest($user);

        return redirect()->route('attendance');
    }

    /**
     * 休憩戻り
     */
    public function endRest(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $this->attendanceService->endRest($user);

        return redirect()->route('attendance');
    }

    /**
     * 修正申請を保存する
     */
    public function storeCorrection(
        AttendanceCorrectionRequest $request,
        Attendance $attendance
    ): RedirectResponse {
        $this->correctionService->storeRequest($request->validated(), $attendance);

        return back();
    }

    /**
     * 修正申請一覧を表示する
     */
    public function correctionList(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        $corrections = AttendanceCorrection::with('attendance')
            ->where('requester_id', Auth::id())
            ->where('status', $status)
            ->latest()
            ->get();

        return Inertia::render('Attendance/CorrectionList', [
            'corrections' => $corrections,
            'status' => $status,
        ]);
    }
}
