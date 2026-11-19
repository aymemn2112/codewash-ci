import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PhantomEvent from './PhantomEvent';

const COOLDOWN_KEY = 'phantomEvent_lastSpawn_v1';
const MIN_COOLDOWN_MS = 5 * 60 * 1000;
const HALF_WINDOW_DELAY_MS = 150000; // Math.random() === 0.5 on a fresh cooldown

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

describe('PhantomEvent', () => {
    it('does not render before the spawn delay', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        renderPhantom();

        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(HALF_WINDOW_DELAY_MS - 1);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
    });

    it('spawns after the random delay when the cooldown has elapsed', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
        expect(Number(localStorage.getItem(COOLDOWN_KEY))).toBeGreaterThan(0);
    });

    it('waits for the remaining cooldown before spawning', () => {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        vi.spyOn(Math, 'random').mockReturnValue(0);
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(MIN_COOLDOWN_MS - 1);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
    });

    it('reports the catch and awards a level when clicked during a battle', () => {
        const onPhantomCaught = vi.fn();
        const onAwardLevel = vi.fn();
        vi.spyOn(Math, 'random').mockReturnValue(0);

        renderPhantom({
            battlingSkillId: 'math',
            onPhantomCaught,
            onAwardLevel,
        });

        act(() => {
            vi.advanceTimersByTime(1);
        });
        fireEvent.click(screen.getByAltText('Phantom'));

        expect(onPhantomCaught).toHaveBeenCalledTimes(1);
        expect(onAwardLevel).toHaveBeenCalledWith('math');
    });

    it('does not award a level when no battle is active', () => {
        const onPhantomCaught = vi.fn();
        const onAwardLevel = vi.fn();
        vi.spyOn(Math, 'random').mockReturnValue(0);

        renderPhantom({ onPhantomCaught, onAwardLevel });

        act(() => {
            vi.advanceTimersByTime(1);
        });
        fireEvent.click(screen.getByAltText('Phantom'));

        expect(onPhantomCaught).toHaveBeenCalledTimes(1);
        expect(onAwardLevel).not.toHaveBeenCalled();
    });

    it('ignores repeated clicks', () => {
        const onPhantomCaught = vi.fn();
        vi.spyOn(Math, 'random').mockReturnValue(0);

        renderPhantom({ onPhantomCaught });

        act(() => {
            vi.advanceTimersByTime(1);
        });
        const phantom = screen.getByAltText('Phantom');
        fireEvent.click(phantom);
        fireEvent.click(phantom);

        expect(onPhantomCaught).toHaveBeenCalledTimes(1);
    });
});

describe('PhantomEvent cooldown bounds', () => {
    it('schedules the next spawn within the cooldown window', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        renderPhantom();

        act(() => {
            vi.advanceTimersByTime(299699);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
    });
});
