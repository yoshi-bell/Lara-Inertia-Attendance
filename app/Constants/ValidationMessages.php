<?php

namespace App\Constants;

/**
 * バリデーションメッセージの共通管理クラス
 * resources/js/constants/validation_messages.json を一次情報として読み込む (SSOT)
 */
class ValidationMessages
{
    /**
     * キャッシュ用
     */
    private static ?array $messages = null;

    /**
     * JSON から全メッセージを取得
     */
    public static function all(): array
    {
        if (self::$messages === null) {
            $path = resource_path('js/constants/validation_messages.json');
            self::$messages = json_decode(file_get_contents($path), true) ?? [];
        }

        return self::$messages;
    }

    /**
     * 特定のメッセージを取得
     */
    public static function get(string $key): string
    {
        return self::all()[$key] ?? '';
    }

    /**
     * 動的なプロパティアクセスのように振る舞う (利便性のため)
     * 例: ValidationMessages::NAME_REQUIRED()
     */
    public static function __callStatic($name, $arguments)
    {
        return self::get($name);
    }
}
