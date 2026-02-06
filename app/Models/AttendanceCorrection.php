<?php

namespace App\Models;

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
        'status'
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