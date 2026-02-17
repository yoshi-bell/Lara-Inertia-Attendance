import { FlashMessage } from './utils';
import { AttendanceStatus } from '@/constants';
import { User } from './models';

export { User };

/**
 * Inertia の共有 Props 型定義
 * T は各ページ固有の Props 型
 */
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash: FlashMessage;
};

/**
 * 勤怠ステータス型 (後方互換性と定数型からの導出)
 */
export type AttendanceStatusType = AttendanceStatus;
