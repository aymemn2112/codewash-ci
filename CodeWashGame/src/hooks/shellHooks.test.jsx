import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDrawers } from './useDrawers';
import { useAudioSettings } from './useAudioSettings';
import { useBorders } from './useBorders';

const bgmManager = {
    isPlaying: false,
    volume: 0.3,
    setVolume: vi.fn(),
    play: vi.fn(),
};

vi.mock('../utils/soundManager', () => ({
    getBGMManager: () => bgmManager,
    setSfxVolume: vi.fn(),
}));

beforeEach(() => {
    localStorage.clear();
    bgmManager.isPlaying = false;
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useDrawers', () => {
    it('starts with everything closed', () => {
        const { result } = renderHook(() => useDrawers());
        expect(result.current.isMenuOpen).toBe(false);
        expect(result.current.isSettingsOpen).toBe(false);
        expect(result.current.isCosmeticsOpen).toBe(false);
    });

    it('opening a drawer closes the others', () => {
        const { result } = renderHook(() => useDrawers());

        act(() => result.current.openMenu());
        act(() => result.current.openSettings());

        expect(result.current.isMenuOpen).toBe(false);
        expect(result.current.isSettingsOpen).toBe(true);

        act(() => result.current.openBugReport());
        expect(result.current.isSettingsOpen).toBe(false);
        expect(result.current.isBugReportOpen).toBe(true);
    });
});

describe('useAudioSettings', () => {
    it('exposes defaults and updates volume', () => {
        const { result } = renderHook(() => useAudioSettings());
        expect(result.current.bgmVol).toBe(0.3);
        expect(result.current.sfxVol).toBe(0.5);

        act(() => result.current.setBgmVol(0.1));
        expect(result.current.bgmVol).toBe(0.1);
    });

    it('starts the BGM only once', () => {
        const { result } = renderHook(() => useAudioSettings());
        act(() => result.current.startBGM());
        expect(bgmManager.play).toHaveBeenCalledTimes(1);

        bgmManager.isPlaying = true;
        act(() => result.current.startBGM());
        expect(bgmManager.play).toHaveBeenCalledTimes(1);
    });
});

describe('useBorders', () => {
    it('uses defaults when nothing is saved', () => {
        const { result } = renderHook(() => useBorders(1));
        expect(result.current.selectedBorder).toBe('solid');
        expect(result.current.borderColor).toBe('#FFD700');
    });

    it('reads saved preferences', () => {
        localStorage.setItem('borderEffect_p2', 'glow');
        localStorage.setItem('borderColor_p2', '#123456');
        const { result } = renderHook(() => useBorders(2));
        expect(result.current.selectedBorder).toBe('glow');
        expect(result.current.borderColor).toBe('#123456');
    });

    it('persists changes', () => {
        const { result } = renderHook(() => useBorders(1));
        act(() => result.current.setSelectedBorder('crystal'));
        expect(localStorage.getItem('borderEffect_p1')).toBe('crystal');
    });
});
