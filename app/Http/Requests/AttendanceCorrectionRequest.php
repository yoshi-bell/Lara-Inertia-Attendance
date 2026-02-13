<?php

namespace App\Http\Requests;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Validator;
use Carbon\Carbon;

/**
 * 勤怠修正申請のバリデーション
 */
class AttendanceCorrectionRequest extends FormRequest
{
    /**
     * 権限チェック
     */
    public function authorize(): bool
    {
        /** @var Attendance $attendance */
        $attendance = $this->route('attendance');

        /** @var User $user */
        $user = Auth::user();

        // 管理者、または自分の勤怠データであり、かつ修正可能な状態であれば許可
        $isOwnerOrAdmin = $user->is_admin || ($user->id === $attendance->user_id);

        return $isOwnerOrAdmin && $attendance->is_editable;
    }

    /**
     * バリデーションルール
     * 
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'requested_start_time' => ['required', 'date_format:H:i'],
            'requested_end_time' => ['required', 'date_format:H:i', 'after:requested_start_time'],
            'reason' => ['required', 'string', 'max:400'],
            'rests' => ['present', 'array'],

            // 休憩関連 (配列要素の検証)
            'rests.*.start_time' => [
                'nullable', 
                'required_with:rests.*.end_time', 
                'date_format:H:i', 
                'after:requested_start_time', 
                'before:requested_end_time'
            ],
            'rests.*.end_time' => [
                'nullable', 
                'required_with:rests.*.start_time', 
                'date_format:H:i', 
                'after:rests.*.start_time', 
                'before:requested_end_time'
            ],
        ];
    }

    /**
     * エラーメッセージ
     * 
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'requested_start_time.required' => '出勤時間を入力してください',
            'requested_end_time.required' => '退勤時間を入力してください',
            'requested_end_time.after' => '出勤時間もしくは退勤時間が不適切な値です',
            'reason.required' => '備考を記入してください',

            'rests.*.start_time.required_with' => '休憩の開始時間を入力してください',
            'rests.*.end_time.required_with' => '休憩の終了時間を入力してください',
            'rests.*.end_time.after' => '休憩の終了時間は、開始時間より後に設定してください',
            'rests.*.start_time.after' => '休憩時間が不適切な値です',
            'rests.*.start_time.before' => '休憩時間が不適切な値です',
            'rests.*.end_time.before' => '休憩時間もしくは退勤時間が不適切な値です',
        ];
    }

    /**
     * カスタムバリデーション (休憩時間の重複チェック)
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $rests = $this->input('rests', []);
            $intervals = [];

            foreach ($rests as $key => $rest) {
                if (!empty($rest['start_time']) && !empty($rest['end_time'])) {
                    $intervals[] = [
                        'start' => Carbon::parse($rest['start_time']),
                        'end' => Carbon::parse($rest['end_time']),
                        'key' => $key
                    ];
                }
            }

            if (count($intervals) < 2) {
                return;
            }

            // 開始時間でソート
            usort($intervals, fn ($a, $b) => $a['start'] <=> $b['start']);

            // 隣接する時間帯が重なっていないかチェック
            for ($i = 0; $i < count($intervals) - 1; $i++) {
                if ($intervals[$i]['end']->gt($intervals[$i + 1]['start'])) {
                    $key1 = $intervals[$i]['key'];
                    $key2 = $intervals[$i + 1]['key'];
                    $validator->errors()->add("rests.{$key1}.end_time", '休憩時間が重複しています。');
                    $validator->errors()->add("rests.{$key2}.start_time", '休憩時間が重複しています。');
                    break;
                }
            }
        });
    }
}
