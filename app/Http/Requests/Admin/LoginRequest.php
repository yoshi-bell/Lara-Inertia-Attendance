<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 管理者ログインバリデーション (FN015, FN016)
 */
class LoginRequest extends FormRequest
{
    /**
     * 権限チェック (ログイン前のため常に許可)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルール
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required'],
        ];
    }

    /**
     * エラーメッセージ (FN016 の文言を遵守)
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => \App\Constants\ValidationMessages::EMAIL_REQUIRED(),
            'email.email' => \App\Constants\ValidationMessages::EMAIL_FORMAT(),
            'password.required' => \App\Constants\ValidationMessages::PASSWORD_REQUIRED(),
        ];
    }
}
