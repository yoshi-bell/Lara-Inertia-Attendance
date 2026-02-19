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
        ('start_time_hi' in data && (typeof data.start_time_hi === 'string' || data.start_time_hi === null))
    );
}

/**
 * 時刻文字列 (HH:mm) の比較を行う
 * time1 が time2 より後の時刻であれば true を返す
 */
export function isTimeAfter(time1: string, time2: string): boolean {
    if (!time1 || !time2) return false;
    // 現状は 24時間制の単純比較だが、将来的に日跨ぎ対応が必要になった際はここを修正する
    return time1 > time2;
}

/**
 * 時刻文字列 (HH:mm) の比較を行う
 * time1 が time2 以前（同じか前）の時刻であれば true を返す
 */
export function isTimeBeforeOrEqual(time1: string, time2: string): boolean {
    if (!time1 || !time2) return false;
    return time1 <= time2;
}
