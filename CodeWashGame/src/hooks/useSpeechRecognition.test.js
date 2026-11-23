import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from './useSpeechRecognition';

const instances = [];

class FakeRecognition {
    constructor() {
        instances.push(this);
        this.started = false;
        this.stopped = false;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
        this.onresult = null;
    }

    start() {
        this.started = true;
        this.onstart?.();
    }

    stop() {
        this.stopped = true;
    }
}

beforeEach(() => {
    instances.length = 0;
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('useSpeechRecognition', () => {
    it('reports support and starts listening', () => {
        const { result } = renderHook(() => useSpeechRecognition(FakeRecognition));
        expect(result.current.isSupported).toBe(true);

        act(() => result.current.start('reading', vi.fn()));

        expect(instances).toHaveLength(1);
        expect(instances[0].started).toBe(true);
        expect(instances[0].lang).toBe('en-US');
        expect(result.current.isListening).toBe(true);
    });

    it('normalises the transcript and forwards it with the skill id', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(FakeRecognition));

        act(() => result.current.start('reading', onResult));
        act(() => {
            instances[0].onresult({ results: [[{ transcript: 'Hello!' }]] });
        });

        expect(result.current.transcript).toBe('HELLO');
        expect(onResult).toHaveBeenCalledWith('HELLO', 'reading');
    });

    it('auto-restarts after onend with backoff', () => {
        const { result } = renderHook(() => useSpeechRecognition(FakeRecognition));
        act(() => result.current.start('reading', vi.fn()));

        act(() => instances[0].onend());
        expect(result.current.isListening).toBe(false);

        act(() => vi.advanceTimersByTime(99));
        expect(instances).toHaveLength(1);

        act(() => vi.advanceTimersByTime(1));
        expect(instances).toHaveLength(2);
    });

    it('increases the restart delay on repeated ends', () => {
        const { result } = renderHook(() => useSpeechRecognition(FakeRecognition));
        act(() => result.current.start('reading', vi.fn()));

        act(() => instances[0].onend()); // schedules 100 ms
        act(() => instances[0].onend()); // reschedules 200 ms
        act(() => vi.advanceTimersByTime(199));
        expect(instances).toHaveLength(1);

        act(() => vi.advanceTimersByTime(1));
        expect(instances).toHaveLength(2);
    });

    it('cancels a pending restart on stop', () => {
        const { result } = renderHook(() => useSpeechRecognition(FakeRecognition));
        act(() => result.current.start('reading', vi.fn()));

        act(() => instances[0].onend());
        act(() => result.current.stop());
        act(() => vi.advanceTimersByTime(10000));

        expect(instances).toHaveLength(1);
        expect(result.current.isListening).toBe(false);
    });

    it('does not restart after a permission error', () => {
        const { result } = renderHook(() => useSpeechRecognition(FakeRecognition));
        act(() => result.current.start('reading', vi.fn()));

        act(() => instances[0].onerror({ error: 'not-allowed' }));
        expect(result.current.error).toBe('not-allowed');

        act(() => instances[0].onend());
        act(() => vi.advanceTimersByTime(10000));
        expect(instances).toHaveLength(1);
    });

    it('toggles listening on and off', () => {
        const { result } = renderHook(() => useSpeechRecognition(FakeRecognition));

        act(() => result.current.toggle('reading', vi.fn()));
        expect(instances).toHaveLength(1);
        expect(result.current.isListening).toBe(true);

        act(() => result.current.toggle('reading', vi.fn()));
        expect(result.current.isListening).toBe(false);
    });

    it('reports unsupported when the API is absent', () => {
        const { result } = renderHook(() => useSpeechRecognition(null));

        expect(result.current.isSupported).toBe(false);
        act(() => result.current.start('reading', vi.fn()));
        expect(result.current.error).toBe('unsupported');
    });
});
