<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
     * JSONに含める追加属性
     *
     * @var list<string>
     */
    protected $appends = [
        'total_rest_time',
        'work_time',
        'start_time_hi',
        'end_time_hi',
        'is_editable',
    ];

    /**
     * 「修正可能かどうか」を判定するアクセサ
     *
     * 1. 退勤済みであれば、修正可能。
     * 2. 未退勤であっても、「業務上の日付（日付変更線 05:00）」が過ぎていれば
     *    退勤忘れとみなして修正を許可する。
     */
    protected function isEditable(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes) {
                // 1. 退勤済み (end_time がある) なら true
                if (! empty($attributes['end_time'])) {
                    return true;
                }

                // 2. 未退勤の場合、業務上の日付が過ぎているか判定
                $workDate = Carbon::parse($attributes['work_date'])->startOfDay();
                // 業務日付の境界: 現在時刻から5時間引いた日の0時
                $currentBusinessDate = Carbon::now()->subHours(5)->startOfDay();

                // 勤務日が過去なら true (退勤忘れ扱い)
                return $workDate->lt($currentBusinessDate);
            }
        );
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'work_date' => 'date:Y-m-d',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    /**
     * 出勤時間の H:i 形式 (表示・入力用)
     */
    protected function startTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->start_time?->format('H:i'));
    }

    /**
     * 退勤時間の H:i 形式 (表示・入力用)
     */
    protected function endTimeHi(): Attribute
    {
        return Attribute::get(fn () => $this->end_time?->format('H:i'));
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
     */
    public static function getFormattedDateWithDay(Carbon $date, string $format = 'Y年m月d日'): string
    {
        $week = ['日', '月', '火', '水', '木', '金', '土'];

        return $date->format($format).'('.$week[$date->dayOfWeek].')';
    }

    /**
     * 合計休憩時間を取得 (動的プロパティ: total_rest_time)
     */
    protected function totalRestTime(): Attribute
    {
        return Attribute::get(function () {
            $totalSeconds = 0;
            foreach ($this->rests as $rest) {
                if ($rest->start_time && $rest->end_time) {
                    // 時刻文字列から再生成することで、日付のズレを排除して計算
                    $start = Carbon::parse($rest->start_time->toTimeString());
                    $end = Carbon::parse($rest->end_time->toTimeString());

                    // 深夜跨ぎ対応: 終了が開始より前なら翌日とみなす
                    if ($end->lt($start)) {
                        $end->addDay();
                    }

                    // Carbon 3系では diffInSeconds は符号付きのため順序に注意
                    $totalSeconds += $start->diffInSeconds($end);
                }
            }

            return $this->formatSecondsToHi($totalSeconds);
        });
    }

    /**
     * 実働時間を取得 (動的プロパティ: work_time)
     */
    protected function workTime(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->start_time || ! $this->end_time) {
                return null;
            }

            // 出退勤時間の差分（秒）
            $start = Carbon::parse($this->start_time->toTimeString());
            $end = Carbon::parse($this->end_time->toTimeString());

            // 深夜跨ぎ対応: 終了が開始より前なら翌日とみなす
            if ($end->lt($start)) {
                $end->addDay();
            }

            $totalWorkSeconds = $start->diffInSeconds($end);

            // 休憩時間の合計（秒）
            $totalRestSeconds = 0;
            foreach ($this->rests as $rest) {
                if ($rest->start_time && $rest->end_time) {
                    $restStart = Carbon::parse($rest->start_time->toTimeString());
                    $restEnd = Carbon::parse($rest->end_time->toTimeString());

                    // 休憩中の深夜跨ぎ対応
                    if ($restEnd->lt($restStart)) {
                        $restEnd->addDay();
                    }

                    $totalRestSeconds += $restStart->diffInSeconds($restEnd);
                }
            }

            $netWorkSeconds = max(0, $totalWorkSeconds - $totalRestSeconds);

            return $this->formatSecondsToHi($netWorkSeconds);
        });
    }

    /**
     * 秒数を H:i 形式の文字列にフォーマットする内部ヘルパー
     */
    private function formatSecondsToHi(int $seconds): string
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);

        return sprintf('%d:%02d', $hours, $minutes);
    }
}
