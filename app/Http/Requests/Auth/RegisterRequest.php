<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

/**
 * 会員登録バリデーションリクエスト
 */
class RegisterRequest extends FormRequest
{
    /**
     * 権限チェック (全員に許可)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルール
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];
    }

    /**
     * エラーメッセージ
     */
    public function messages(): array
    {
        return [
            'name.required' => \App\Constants\ValidationMessages::NAME_REQUIRED(),
            'email.required' => \App\Constants\ValidationMessages::EMAIL_REQUIRED(),
            'password.required' => \App\Constants\ValidationMessages::PASSWORD_REQUIRED(),
            'password.min' => \App\Constants\ValidationMessages::PASSWORD_MIN(),
            'password.confirmed' => \App\Constants\ValidationMessages::PASSWORD_CONFIRMED(),
        ];
    }
}
