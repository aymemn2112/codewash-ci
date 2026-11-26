import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimeouts } from './useTimeouts';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('useTimeouts', () => {
    it('runs a scheduled callback after the delay', () => {
        const fn = vi.fn();
        const { result } = renderHook(() => useTimeouts());

        act(() => {
            result.current.schedule(fn, 500);
        });
        act(() => vi.advanceTimersByTime(499));
        expect(fn).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('clears pending timers on unmount', () => {
        const fn = vi.fn();
        const { result, unmount } = renderHook(() => useTimeouts());

        act(() => {
            result.current.schedule(fn, 1000);
        });
        unmount();
        act(() => vi.advanceTimersByTime(5000));

        expect(fn).not.toHaveBeenCalled();
    });

    it('can clear a scheduled callback explicitly', () => {
        const fn = vi.fn();
        const { result } = renderHook(() => useTimeouts());

        let id;
        act(() => {
            id = result.current.schedule(fn, 1000);
        });
        act(() => result.current.clear(id));
        act(() => vi.advanceTimersByTime(5000));

        expect(fn).not.toHaveBeenCalled();
    });
});
