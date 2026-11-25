import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PhantomEvent from './PhantomEvent';
import { STORAGE_KEYS } from '../services/storageKeys';

const COOLDOWN_KEY = STORAGE_KEYS.PHANTOM_LAST_SPAWN;
const MIN_COOLDOWN_MS = 5 * 60 * 1000;

const memoryStorage = (initial = {}) => {
    const data = new Map(Object.entries(initial));
    return {
        getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
        setItem: vi.fn((key, value) => data.set(key, value)),
        removeItem: vi.fn((key) => data.delete(key)),
    };
};

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

describe('PhantomEvent with an injected storage', () => {
    it('writes the cooldown through the injected storage', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const storage = memoryStorage();
        renderPhantom({ rng: () => 0, storage });

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
        expect(storage.setItem).toHaveBeenCalledWith(
            COOLDOWN_KEY,
            new Date('2025-01-01T00:00:00Z').getTime().toString(),
        );
        expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('reads the cooldown through the injected storage', () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        const storage = memoryStorage({
            [COOLDOWN_KEY]: String(Date.now() - MIN_COOLDOWN_MS / 2),
        });
        renderPhantom({ rng: () => 0, storage });

        act(() => {
            vi.advanceTimersByTime(MIN_COOLDOWN_MS / 2 - 1);
        });
        expect(screen.queryByAltText('Phantom')).not.toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(screen.getByAltText('Phantom')).toBeInTheDocument();
        expect(storage.getItem).toHaveBeenCalledWith(COOLDOWN_KEY);
        expect(getItemSpy).not.toHaveBeenCalled();
    });
});
