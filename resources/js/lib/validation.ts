import { z } from 'zod';

/**
 * Zod バリデーションの実行オプション
 */
interface ValidationOptions {
    /** 同一フィールドの複数のエラーメッセージを結合して表示するかどうか */
    joinMessages?: boolean;
}

/**
 * Zod の検証結果を Inertia のエラー形式に変換し、setError に適用する
 * 
 * 【設計意図】
 * 1. UXの柔軟性: options.joinMessages により、最初のエラーのみ表示（Login等）と
 *    全エラー表示（詳細画面の複雑なバリデーション等）を切り替え可能。
 * 2. ネスト対応: issue.path.join('.') により、Inertia のドット記法エラーキーに対応。
 * 3. 堅牢性: any を排除し、unknown とジェネリクスによる型安全な実装。
 * 
 * @param result Zod の safeParse 結果
 * @param setError Inertia useForm の setError 関数 (第一引数に string を受け取れるもの)
 * @param options オプション設定
 * @returns バリデーションを通過した場合は true
 */
export function performZodValidation<T extends Record<string, unknown>>(
    result: z.ZodSafeParseSuccess<T> | z.ZodSafeParseError<T>,
    setError: (path: string, message: string) => void,
    options: ValidationOptions = { joinMessages: false }
): boolean {
    if (result.success) {
        return true;
    }

    const fieldErrors: Record<string, string[]> = {};

    result.error.issues.forEach((issue: z.ZodIssue) => {
        // ネストされたパスをドット記法（rests.0.start_time）に変換
        const path = issue.path.map(String).join('.');
        
        if (!fieldErrors[path]) {
            fieldErrors[path] = [];
        }

        // 重複メッセージを避けて収集
        if (!fieldErrors[path].includes(issue.message)) {
            fieldErrors[path].push(issue.message);
        }
    });

    Object.entries(fieldErrors).forEach(([path, messages]) => {
        // joinMessages が true なら全メッセージを結合、false なら最初の一つのみ
        const displayMessage = options.joinMessages
            ? messages.join(' / ')
            : messages[0];
            
        setError(path, displayMessage);
    });

    return false;
}
