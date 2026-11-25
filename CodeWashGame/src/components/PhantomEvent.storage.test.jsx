import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PhantomEvent from './PhantomEvent';

const COOLDOWN_KEY = 'phantomEvent_lastSpawn_v1';
const MIN_COOLDOWN_MS = 5 * 60 * 1000;

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

describe('PhantomEvent storage', () => {
    it('writes the cooldown under the versioned key', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(localStorage.getItem(COOLDOWN_KEY)).not.toBeNull();
    });

    it('reads an existing cooldown from localStorage', () => {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now() - MIN_COOLDOWN_MS / 2));
        vi.spyOn(Math, 'random').mockReturnValue(0);
        renderPhantom();

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
