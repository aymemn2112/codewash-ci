import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PhantomEvent from './PhantomEvent';
import { STORAGE_KEYS } from '../services/storageKeys';

const COOLDOWN_KEY = STORAGE_KEYS.PHANTOM_LAST_SPAWN;
const MIN_COOLDOWN_MS = 5 * 60 * 1000;
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

describe('PhantomEvent random inputs', () => {
    it('starts from the right when random is 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(outerWrapper().style.left).toBe('calc(100vw)');
        expect(outerWrapper().style.animation).toContain('phantomFlyRight');
        expect(screen.getByAltText('Phantom').parentElement.style.transform).toBe('scaleX(1)');
    });

    it('starts from the left when random is just below 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(MAX_EXTRA_MS);
        });

        expect(outerWrapper().style.left).toBe('-120px');
        expect(outerWrapper().style.animation).toContain('phantomFlyLeft');
        expect(screen.getByAltText('Phantom').parentElement.style.transform).toBe('scaleX(-1)');
    });

    it('uses the whole random window on a fresh cooldown', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        const upperDelay = Math.round(0.999 * MAX_EXTRA_MS) - 1;
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(upperDelay);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
    });

    it('adds the random extra to the remaining cooldown', () => {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const expectedDelay = MIN_COOLDOWN_MS + MAX_EXTRA_MS * 0.5;
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(expectedDelay - 1);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
    });
});
