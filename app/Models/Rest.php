<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * 休憩記録モデル
 */
class Rest extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'attendance_id',
        'start_time',
        'end_time',
    ];

    /**
     * JSONに含める追加属性
     */
    protected $appends = [
        'start_time_hi',
        'end_time_hi',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    /**
     * 休憩開始時間の H:i 形式
     */
    protected function startTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->start_time?->format('H:i'));
    }

    /**
     * 休憩終了時間の H:i 形式
     */
    protected function endTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->end_time?->format('H:i'));
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
}