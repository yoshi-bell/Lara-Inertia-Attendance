<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
     * JSONに含める追加属性
     */
    protected $appends = [
        'requested_start_time_hi',
        'requested_end_time_hi',
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
     * 修正後の休憩開始時刻の H:i 形式
     */
    protected function requestedStartTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->requested_start_time?->format('H:i'));
    }

    /**
     * 修正後の休憩終了時刻の H:i 形式
     */
    protected function requestedEndTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->requested_end_time?->format('H:i'));
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