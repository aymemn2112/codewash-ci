import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PhantomEvent from './PhantomEvent';
import { STORAGE_KEYS } from '../services/storageKeys';

const COOLDOWN_KEY = STORAGE_KEYS.PHANTOM_LAST_SPAWN;
const MIN_COOLDOWN_MS = 5 * 60 * 1000;
const INJECTED_NOW = new Date('2025-02-02T00:00:00Z').getTime();

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    localStorage.clear();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
});

const renderPhantom = (props = {}) =>
    render(
        <PhantomEvent
            battlingSkillId={null}
            onAwardLevel={() => {}}
            onPhantomCaught={() => {}}
            {...props}
        />,
    );

describe('PhantomEvent with an injected clock', () => {
    it('records the spawn at the injected time', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        renderPhantom({ rng: () => 0, clock: () => new Date(INJECTED_NOW) });

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
        expect(Number(localStorage.getItem(COOLDOWN_KEY))).toBe(INJECTED_NOW);
    });

    it('computes the remaining cooldown from the injected clock', () => {
        localStorage.setItem(COOLDOWN_KEY, String(INJECTED_NOW - MIN_COOLDOWN_MS / 2));
        renderPhantom({ rng: () => 0, clock: () => new Date(INJECTED_NOW) });

        act(() => {
            vi.advanceTimersByTime(MIN_COOLDOWN_MS / 2 - 1);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
    });
});
