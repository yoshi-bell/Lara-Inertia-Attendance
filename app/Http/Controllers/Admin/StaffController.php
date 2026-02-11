<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Response as FacadesResponse;

/**
 * 管理者用スタッフ管理コントローラー
 */
class StaffController extends Controller
{
    private CalendarService $calendarService;

    public function __construct(CalendarService $calendarService)
    {
        $this->calendarService = $calendarService;
    }

    /**
     * スタッフ一覧を表示する
     */
    public function index(): Response
    {
        // 憲法に従い、現時点ではページネーションは行わず全スタッフを取得
        $staffs = User::where('is_admin', false)->orderBy('id', 'asc')->get();

        return Inertia::render('Admin/Staff/Index', [
            'staffs' => $staffs,
        ]);
    }

    /**
     * 特定のスタッフの月別勤怠一覧を表示する
     */
    public function showAttendance(Request $request, User $user): Response
    {
        $monthStr = $request->input('month', Carbon::now()->format('Y-m'));
        $currentDate = Carbon::parse($monthStr)->startOfMonth();

        return Inertia::render('Admin/Staff/Detail', [
            'staff' => $user,
            'calendarData' => $this->calendarService->generate($user, $currentDate),
            'navigation' => [
                'currentMonth' => $currentDate->format('Y年m月'),
                'prevMonth' => $currentDate->copy()->subMonth()->format('Y-m'),
                'nextMonth' => $currentDate->copy()->addMonth()->format('Y-m'),
            ],
        ]);
    }

    /**
     * スタッフの月次勤怠一覧をCSVとしてエクスポートする
     */
    public function exportCsv(Request $request, User $user)
    {
        $monthStr = $request->input('month', Carbon::now()->format('Y-m'));
        $currentDate = Carbon::parse($monthStr)->startOfMonth();
        $calendarData = $this->calendarService->generate($user, $currentDate);

        $fileName = 'attendance_' . $user->name . '_' . $currentDate->format('Ym') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        $callback = function () use ($calendarData) {
            $stream = fopen('php://output', 'w');
            
            // Excelでの文字化け防止のため CP932 (Shift-JIS) に変換するフィルタを適用
            stream_filter_prepend($stream, 'convert.iconv.utf-8/cp932//TRANSLIT');

            fputcsv($stream, [
                '日付',
                '出勤',
                '退勤',
                '休憩',
                '合計',
            ]);

            foreach ($calendarData as $dayData) {
                fputcsv($stream, [
                    $dayData['date'],
                    $dayData['attendance']['start_time'] ?? '',
                    $dayData['attendance']['end_time'] ?? '',
                    $dayData['attendance'] ? $dayData['attendance']['total_rest_time'] : '',
                    $dayData['attendance'] ? $dayData['attendance']['work_time'] : '',
                ]);
            }

            fclose($stream);
        };

        return FacadesResponse::stream($callback, 200, $headers);
    }
}
