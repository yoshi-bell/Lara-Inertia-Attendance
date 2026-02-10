<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrection;
use App\Services\CorrectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * 管理者用修正申請管理コントローラー (US014, US015)
 * 基本設計書の定義に準拠: Admin/CorrectionRequestController
 */
class CorrectionRequestController extends Controller
{
    private CorrectionService $correctionService;

    public function __construct(CorrectionService $correctionService)
    {
        $this->correctionService = $correctionService;
    }

    /**
     * 修正申請一覧を表示する (US014)
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        // 旧プロジェクト通り、申請者(requester)と勤怠データをロードし、作成日時順に並べる
        $corrections = AttendanceCorrection::with(['requester', 'attendance.user'])
            ->where('status', $status)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Admin/CorrectionRequest/Index', [
            'corrections' => $corrections,
            'status' => $status,
        ]);
    }

    /**
     * 申請詳細・承認画面を表示する (US015)
     */
    public function show(AttendanceCorrection $attendanceCorrection): Response
    {
        // 承認に必要な全データをロード
        $attendanceCorrection->load([
            'requester',
            'attendance.user',
            'attendance.rests',
            'restCorrections'
        ]);

        return Inertia::render('Admin/CorrectionRequest/Approve', [
            'correction' => $attendanceCorrection,
        ]);
    }

    /**
     * 修正申請を承認する (US015)
     */
    public function approve(AttendanceCorrection $attendanceCorrection): RedirectResponse
    {
        // 既に処理済みの場合はエラー
        if ($attendanceCorrection->status !== 'pending') {
            return back()->with('error', 'この申請は既に処理されています。');
        }

        $this->correctionService->approveRequest($attendanceCorrection);

        // 承認完了後は、旧プロジェクト通り詳細画面へリダイレクトして成功メッセージを表示
        return redirect()->route('admin.corrections.approve.show', $attendanceCorrection->id)
            ->with('success', '申請を承認しました。');
    }
}
