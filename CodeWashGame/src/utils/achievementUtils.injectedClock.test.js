import { afterEach, describe, expect, it, vi } from 'vitest';
import { recordLoginDate } from './achievementUtils';

afterEach(() => vi.useRealTimers());

describe('recordLoginDate with an injected clock', () => {
    it('uses the injected date instead of the system date', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
        const clock = () => new Date('2030-05-06T08:00:00Z');

        expect(recordLoginDate([], clock)).toEqual(['2030-05-06']);
        expect(recordLoginDate(['2030-05-06'], clock)).toEqual(['2030-05-06']);
    });
});
