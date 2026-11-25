import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PhantomEvent from './PhantomEvent';
import { STORAGE_KEYS } from '../services/storageKeys';

const COOLDOWN_KEY = STORAGE_KEYS.PHANTOM_LAST_SPAWN;
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

describe('PhantomEvent cooldown clock', () => {
    it('records the spawn at the current system time', () => {
        const spawnTime = Date.now();
        vi.spyOn(Math, 'random').mockReturnValue(0);
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
        expect(Number(localStorage.getItem(COOLDOWN_KEY))).toBe(spawnTime);
    });

    it('waits the remaining cooldown from the stored spawn time', () => {
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
