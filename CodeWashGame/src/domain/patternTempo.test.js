import { describe, it, expect } from 'vitest';
import { clamp, lerp, getTempoDelays, MAX_TEMPO_DELAY, MIN_TEMPO_DELAY } from './patternTempo';

describe('tempo helpers', () => {
    it('clamps values', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-1, 0, 10)).toBe(0);
        expect(clamp(11, 0, 10)).toBe(10);
    });

    it('interpolates and clamps t', () => {
        expect(lerp(0, 10, 0.5)).toBe(5);
        expect(lerp(0, 10, -1)).toBe(0);
        expect(lerp(0, 10, 2)).toBe(10);
    });
});

describe('getTempoDelays', () => {
    it('starts slow on difficulty 1', () => {
        expect(getTempoDelays(0, 1)).toEqual({
            onDelay: MAX_TEMPO_DELAY,
            offDelay: Math.max(100, Math.round(MAX_TEMPO_DELAY * 0.35)),
        });
    });

    it('starts fast on difficulty 7', () => {
        expect(getTempoDelays(0, 7)).toEqual({
            onDelay: MIN_TEMPO_DELAY,
            offDelay: 100,
        });
    });

    it('accelerates over rounds and never goes below the floor', () => {
        const first = getTempoDelays(0, 1).onDelay;
        const later = getTempoDelays(9, 1).onDelay;
        expect(later).toBeLessThan(first);
        expect(later).toBeGreaterThanOrEqual(MIN_TEMPO_DELAY);
    });

    it('keeps the off delay above 100ms', () => {
        for (let round = 0; round < 20; round++) {
            expect(getTempoDelays(round, 1).offDelay).toBeGreaterThanOrEqual(100);
        }
    });
});
