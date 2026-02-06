<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 休憩修正申請モデル
 */
class RestCorrection extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'attendance_correction_id',
        'requested_start_time',
        'requested_end_time',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requested_start_time' => 'datetime',
            'requested_end_time' => 'datetime',
        ];
    }

    /**
     * 勤怠修正申請とのリレーション
     *
     * @return BelongsTo<AttendanceCorrection, $this>
     */
    public function attendanceCorrection(): BelongsTo
    {
        return $this->belongsTo(AttendanceCorrection::class);
    }
}