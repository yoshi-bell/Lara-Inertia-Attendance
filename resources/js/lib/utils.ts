import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { User, Attendance } from '@/types/models';

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

/**
 * data が User 型であることを確認する型ガード
 */
export function isUser(data: unknown): data is User {
    return (
        isObject(data) &&
        typeof data.id === 'number' &&
        typeof data.name === 'string' &&
        typeof data.email === 'string'
    );
}

/**
 * data が Attendance 型であることを確認する型ガード
 */
export function isAttendance(data: unknown): data is Attendance {
    return (
        isObject(data) &&
        typeof data.id === 'number' &&
        typeof data.work_date === 'string' &&
        ('start_time' in data && (typeof data.start_time === 'string' || data.start_time === null))
    );
}
