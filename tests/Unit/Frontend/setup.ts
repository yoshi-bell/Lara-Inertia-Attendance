import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Inertia の route ヘルパー (Ziggy) をテスト環境でモック、またはグローバル登録
// 今回はシンプルなモックとして定義
(global as any).route = vi.fn((name) => `/${name}`);

// ResizeObserver のモック (Radix UI / Shadcn UI で必要になる場合があるため)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
