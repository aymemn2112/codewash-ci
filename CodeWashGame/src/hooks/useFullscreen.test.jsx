import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from './useFullscreen';
import { playClick } from '../utils/soundManager';

vi.mock('../utils/soundManager', () => ({ playClick: vi.fn() }));

beforeEach(() => {
    playClick.mockClear();
});

afterEach(() => {
    delete document.fullscreenElement;
    delete document.documentElement.requestFullscreen;
    delete document.exitFullscreen;
    vi.restoreAllMocks();
});

describe('useFullscreen', () => {
    it('starts out of fullscreen', () => {
        const { result } = renderHook(() => useFullscreen());
        expect(result.current.isFullscreen).toBe(false);
    });

    it('requests fullscreen and plays a click', () => {
        document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useFullscreen());

        act(() => result.current.toggle());

        expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
        expect(playClick).toHaveBeenCalledTimes(1);
    });

    it('exits fullscreen when already active', () => {
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            value: document.documentElement,
        });
        document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useFullscreen());

        act(() => result.current.toggle());

        expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    });

    it('tracks fullscreenchange events', () => {
        const { result } = renderHook(() => useFullscreen());

        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            value: document.documentElement,
        });
        act(() => {
            document.dispatchEvent(new Event('fullscreenchange'));
        });
        expect(result.current.isFullscreen).toBe(true);
    });
});
