import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * ユーザー定義型ガード (Type Guards)
 * unknown 型を安全に特定の型へ絞り込む
 */

/**
 * data がオブジェクトであることを確認する基本ガード
 * (null は object だが除外する)
 */
export function isObject(data: unknown): data is Record<string, unknown> {
    return typeof data === 'object' && data !== null;
}
