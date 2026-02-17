<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\Rest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * 勤怠修正申請に関するビジネスロジック
 */
class CorrectionService
{
    /**
     * 修正申請を新規保存する
     *
     * @param  array<string, mixed>  $data  バリデーション済みデータ
     * @param  Attendance  $attendance  修正対象の勤怠
     */
    public function storeRequest(array $data, Attendance $attendance): void
    {
        DB::transaction(function () use ($data, $attendance) {
            $workDate = $attendance->work_date->format('Y-m-d');

            /** @var AttendanceCorrection $attendanceCorrection */
            $attendanceCorrection = $attendance->corrections()->create([
                'requester_id' => Auth::id(),
                'requested_start_time' => $workDate.' '.$data['requested_start_time'],
                'requested_end_time' => $workDate.' '.$data['requested_end_time'],
                'reason' => $data['reason'],
                'status' => 'pending',
            ]);

            // 休憩の修正情報を保存
            if (! empty($data['rests'])) {
                foreach ($data['rests'] as $restData) {
                    if (! empty($restData['start_time']) && ! empty($restData['end_time'])) {
                        $attendanceCorrection->restCorrections()->create([
                            'requested_start_time' => $workDate.' '.$restData['start_time'],
                            'requested_end_time' => $workDate.' '.$restData['end_time'],
                        ]);
                    }
                }
            }
        });
    }

    /**
     * 修正申請を承認し、勤怠データを更新する (Phase 4用)
     */
    public function approveRequest(AttendanceCorrection $attendanceCorrection): void
    {
        if ($attendanceCorrection->status !== 'pending') {
            return;
        }

        DB::transaction(function () use ($attendanceCorrection) {
            $attendance = $attendanceCorrection->attendance;

            // 勤怠本体の更新
            $attendance->update([
                'start_time' => $attendanceCorrection->requested_start_time,
                'end_time' => $attendanceCorrection->requested_end_time,
            ]);

            // 休憩データの再構築
            $attendance->rests()->delete();
            foreach ($attendanceCorrection->restCorrections as $restCorrection) {
                Rest::create([
                    'attendance_id' => $attendance->id,
                    'start_time' => $restCorrection->requested_start_time,
                    'end_time' => $restCorrection->requested_end_time,
                ]);
            }

            // ステータス更新
            $attendanceCorrection->update(['status' => 'approved']);
        });
    }
}
