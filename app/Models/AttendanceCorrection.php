<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 勤怠修正申請モデル
 */
class AttendanceCorrection extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'attendance_id',
        'requester_id',
        'requested_start_time',
        'requested_end_time',
        'reason',
        'status',
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
     * 修正申請（開始）の H:i 形式
     */
    protected function requestedStartTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->requested_start_time?->format('H:i'));
    }

    /**
     * 修正申請（終了）の H:i 形式
     */
    protected function requestedEndTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->requested_end_time?->format('H:i'));
    }

    /**
     * 勤怠記録とのリレーション
     *
     * @return BelongsTo<Attendance, $this>
     */
    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    /**
     * 申請者とのリレーション
     *
     * @return BelongsTo<User, $this>
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * 休憩時間の修正申請とのリレーション
     *
     * @return HasMany<RestCorrection, $this>
     */
    public function restCorrections(): HasMany
    {
        return $this->hasMany(RestCorrection::class);
    }
}
