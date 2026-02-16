import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/**
 * 1. route (Ziggy) のモック
 * Inertia ページ内での route() 呼び出しをシミュレート
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).route = vi.fn((name: string) => `/${name}`);

/**
 * 2. ResizeObserver のモック (クラス形式で定義)
 * Radix UI / Shadcn UI (Floating UI) のコンストラクタ呼び出しに対応
 */
class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

// vi.stubGlobal を使用して、エディタの型エラーを回避しつつグローバルに登録
vi.stubGlobal('ResizeObserver', ResizeObserverMock);
