import { describe, it, expect } from 'vitest';
import { isObject } from './utils';

describe('isObject utility', () => {
    it('オブジェクトを渡したときに true を返すこと', () => {
        expect(isObject({ a: 1 })).toBe(true);
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true); // 配列も JS では object
    });

    it('null を渡したときに false を返すこと', () => {
        expect(isObject(null)).toBe(false);
    });

    it('プリミティブ値を渡したときに false を返すこと', () => {
        expect(isObject(123)).toBe(false);
        expect(isObject('string')).toBe(false);
        expect(isObject(true)).toBe(false);
        expect(isObject(undefined)).toBe(false);
    });

    it('型ガードとして機能すること', () => {
        const data: unknown = { key: 'value' };
        
        if (isObject(data)) {
            // ここで data['key'] にアクセスしても型エラーにならない（Record<string, unknown> への絞り込み）
            expect(data.key).toBe('value');
        }
    });
});
