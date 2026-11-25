import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PhantomEvent from './PhantomEvent';

const COOLDOWN_KEY = 'phantomEvent_lastSpawn_v1';
const MAX_EXTRA_MS = 5 * 60 * 1000;

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

const outerWrapper = () => screen.getByAltText('Phantom').parentElement.parentElement;

describe('PhantomEvent with an injected rng', () => {
    it('uses it for the delay and the direction instead of Math.random', () => {
        const mathSpy = vi.spyOn(Math, 'random');
        const rng = vi.fn(() => 0);
        renderPhantom({ rng });

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(outerWrapper().style.left).toBe('calc(100vw)');
        expect(rng).toHaveBeenCalledTimes(2);
        expect(mathSpy).not.toHaveBeenCalled();
    });

    it('uses it for the upper bound and the left direction', () => {
        const mathSpy = vi.spyOn(Math, 'random');
        const rng = vi.fn(() => 0.999);
        renderPhantom({ rng });

        act(() => {
            vi.advanceTimersByTime(MAX_EXTRA_MS);
        });

        expect(outerWrapper().style.left).toBe('-120px');
        expect(rng).toHaveBeenCalledTimes(2);
        expect(mathSpy).not.toHaveBeenCalled();
    });

    it('uses it for the remaining cooldown branch', () => {
        const mathSpy = vi.spyOn(Math, 'random');
        const rng = vi.fn(() => 0.5);
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        renderPhantom({ rng });

        act(() => {
            vi.advanceTimersByTime(449999);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
        expect(mathSpy).not.toHaveBeenCalled();
    });
});
