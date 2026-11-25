import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultRng } from './rng';

afterEach(() => vi.restoreAllMocks());

describe('defaultRng', () => {
    it('delegates to Math.random at call time', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.42);
        expect(defaultRng()).toBe(0.42);
    });

    it('returns a number in [0, 1)', () => {
        const value = defaultRng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
    });
});
