import { afterEach, describe, expect, it, vi } from 'vitest';
import { recordLoginDate } from './achievementUtils';

afterEach(() => vi.useRealTimers());

describe('recordLoginDate with the system clock', () => {
    it('records the current day once', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));

        expect(recordLoginDate([])).toEqual(['2025-01-15']);
        expect(recordLoginDate(['2025-01-15'])).toEqual(['2025-01-15']);
    });

    it('uses the day of the current date, not the time', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-16T23:59:00Z'));

        expect(recordLoginDate(['2025-01-15'])).toEqual(['2025-01-15', '2025-01-16']);
    });
});
