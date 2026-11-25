import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultClock } from './clock';

afterEach(() => vi.useRealTimers());

describe('defaultClock', () => {
    it('returns the current date at call time', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
        expect(defaultClock().toISOString()).toBe('2025-01-15T10:00:00.000Z');
    });
});
