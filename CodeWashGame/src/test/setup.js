import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// jsdom does not implement media playback. Stub it before every test so
// components that create Audio elements do not throw or print
// "Not implemented" errors. Tests can still spy on play/pause.
beforeEach(() => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
});
