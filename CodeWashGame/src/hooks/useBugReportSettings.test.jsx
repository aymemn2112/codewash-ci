import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBugReportSettings } from './useBugReportSettings';

beforeEach(() => {
    localStorage.clear();
});

describe('useBugReportSettings', () => {
    it('defaults to an empty endpoint', () => {
        const { result } = renderHook(() => useBugReportSettings());
        expect(result.current.endpoint).toBe('');
    });

    it('reads a saved endpoint', () => {
        localStorage.setItem('bugReportEndpoint_v1', 'http://localhost:8787/report');
        const { result } = renderHook(() => useBugReportSettings());
        expect(result.current.endpoint).toBe('http://localhost:8787/report');
    });

    it('persists endpoint changes', () => {
        const { result } = renderHook(() => useBugReportSettings());
        act(() => result.current.setEndpoint('https://example.test/report'));
        expect(result.current.endpoint).toBe('https://example.test/report');
        expect(localStorage.getItem('bugReportEndpoint_v1')).toBe('https://example.test/report');
    });
});
