<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

/**
 * 勤怠記録モデル
 */
class Attendance extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'work_date',
        'start_time',
        'end_time',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'work_date' => 'date',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    /**
     * ユーザーとのリレーション
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 休憩記録とのリレーション
     *
     * @return HasMany<Rest, $this>
     */
    public function rests(): HasMany
    {
        return $this->hasMany(Rest::class);
    }

    /**
     * 修正申請とのリレーション
     *
     * @return HasMany<AttendanceCorrection, $this>
     */
    public function corrections(): HasMany
    {
        return $this->hasMany(AttendanceCorrection::class);
    }

    /**
     * 日付を日本語の曜日付きでフォーマットする静的ヘルパー
     *
     * @param Carbon $date
     * @param string $format
     * @return string
     */
    public static function getFormattedDateWithDay(Carbon $date, string $format = 'Y年m月d日'): string
    {
        $week = ['日', '月', '火', '水', '木', '金', '土'];
        return $date->format($format) . '(' . $week[$date->dayOfWeek] . ')';
    }

    /**
     * 合計休憩時間を H:i 形式で取得するアクセサ (動的プロパティ: total_rest_time)
     *
     * @return string
     */
    public function getTotalRestTimeAttribute(): string
    {
        $totalSeconds = 0;
        foreach ($this->rests as $rest) {
            if ($rest->start_time && $rest->end_time) {
                $totalSeconds += $rest->end_time->diffInSeconds($rest->start_time);
            }
        }
        return $this->formatSecondsToHi($totalSeconds);
    }

    /**
     * 実働時間を H:i 形式で取得するアクセサ (動的プロパティ: work_time)
     *
     * @return string|null
     */
    public function getWorkTimeAttribute(): ?string
    {
        if (!$this->start_time || !$this->end_time) {
            return null;
        }

        $totalWorkSeconds = $this->end_time->diffInSeconds($this->start_time);

        $totalRestSeconds = 0;
        foreach ($this->rests as $rest) {
            if ($rest->start_time && $rest->end_time) {
                $totalRestSeconds += $rest->end_time->diffInSeconds($rest->start_time);
            }
        }

        $netWorkSeconds = max(0, $totalWorkSeconds - $totalRestSeconds);

        return $this->formatSecondsToHi($netWorkSeconds);
    }

    /**
     * 秒数を H:i 形式の文字列にフォーマットする内部ヘルパー
     *
     * @param int $seconds
     * @return string
     */
    private function formatSecondsToHi(int $seconds): string
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);

        return sprintf('%d:%02d', $hours, $minutes);
    }
}