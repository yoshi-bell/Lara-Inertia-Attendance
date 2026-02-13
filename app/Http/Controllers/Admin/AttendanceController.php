<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\AttendanceCorrectionRequest;
use Illuminate\Support\Facades\DB;

/**
 * 管理者用勤怠管理コントローラー (US010, US011)
 * 基本設計書の定義に準拠: Admin/AttendanceController
 */
class AttendanceController extends Controller
{
    /**
     * 日次勤怠一覧を表示する (US010)
     */
    public function index(Request $request): Response
    {
        // クエリパラメータから日付を取得 (デフォルトは今日)
        $dateStr = $request->input('date', Carbon::today()->format('Y-m-d'));
        $currentDate = Carbon::parse($dateStr);

        // その日の全ユーザーの勤怠情報を取得 (N+1問題回避のため user, rests を Eager Loading)
        $attendances = Attendance::with(['user', 'rests'])
            ->whereDate('work_date', $currentDate)
            ->latest()
            ->get();

        return Inertia::render('Admin/Attendance/Index', [
            'attendances' => $attendances,
            'navigation' => [
                'date' => $currentDate->format('Y-m-d'),
                'displayDate' => $currentDate->format('Y年n月j日'),
                'prevDate' => $currentDate->copy()->subDay()->format('Y-m-d'),
                'nextDate' => $currentDate->copy()->addDay()->format('Y-m-d'),
                'today' => Carbon::today()->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * 特定の勤怠詳細を表示する (US011)
     */
    public function show(Attendance $attendance): Response
    {
        $attendance->load([
            'user:id,name',
            'rests',
            'corrections' => function ($query) {
                $query->where('status', 'pending')->with('restCorrections')->latest();
            }
        ]);

        return Inertia::render('Admin/Attendance/Detail', [
            'attendance' => $attendance,
            'pendingCorrection' => $attendance->corrections->first(),
        ]);
    }

    /**
     * 勤怠情報を管理者として直接更新する (FN040)
     */
    public function update(AttendanceCorrectionRequest $request, Attendance $attendance): RedirectResponse
    {
        // 業務時間中（当日）の不正更新を防止 (SSOTガード)
        if (!$attendance->is_editable) {
            abort(403, '当日の勤怠データは更新できません。');
        }

        $data = $request->validated();
        $workDate = $attendance->work_date->format('Y-m-d');

        DB::transaction(function () use ($attendance, $data, $workDate) {
            // 勤怠本体の更新
            $attendance->update([
                'start_time' => $workDate . ' ' . $data['requested_start_time'],
                'end_time' => $workDate . ' ' . $data['requested_end_time'],
            ]);

            // 休憩データの再構築 (一度全て削除してから新規作成)
            $attendance->rests()->delete();
            if (!empty($data['rests'])) {
                foreach ($data['rests'] as $restData) {
                    if (!empty($restData['start_time']) && !empty($restData['end_time'])) {
                        $attendance->rests()->create([
                            'start_time' => $workDate . ' ' . $restData['start_time'],
                            'end_time' => $workDate . ' ' . $restData['end_time'],
                        ]);
                    }
                }
            }
        });

        return back()->with('success', '勤怠情報を更新しました。');
    }
}
