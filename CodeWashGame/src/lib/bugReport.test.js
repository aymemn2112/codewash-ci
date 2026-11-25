import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { collectGameFiles, buildBugReport, sendBugReport, fileToDataUrl } from './bugReport';
import { addLogEntry, clearLogEntries } from './logBuffer';
import { STORAGE_KEYS, getStorageKey } from '../services/storageKeys';

const makeStorage = (values = {}) => ({
    getItem: (key) => (key in values ? values[key] : null),
});

beforeEach(() => {
    clearLogEntries();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('collectGameFiles', () => {
    it('includes saved keys that exist', () => {
        const storage = makeStorage({
            [STORAGE_KEYS.CURRENT_PROFILE]: '1',
            [getStorageKey(1)]: '{"level":3}',
        });
        const files = collectGameFiles(storage);
        expect(files[STORAGE_KEYS.CURRENT_PROFILE]).toBe('1');
        expect(files[getStorageKey(1)]).toBe('{"level":3}');
        expect(Object.keys(files)).toHaveLength(2);
    });
});

describe('buildBugReport', () => {
    it('builds a report with metadata, logs and game files', () => {
        addLogEntry('error', ['kaboom']);
        const storage = makeStorage({ [STORAGE_KEYS.CURRENT_PROFILE]: '2' });

        const report = buildBugReport({
            description: '  It broke  ',
            steps: ' 1. click ',
            includeLogs: true,
            screenshots: ['data:image/png;base64,x'],
            storage,
            userAgent: 'test-agent',
            appVersion: '1.2.3',
            now: () => new Date('2026-01-01T00:00:00Z'),
        });

        expect(report.description).toBe('It broke');
        expect(report.steps).toBe('1. click');
        expect(report.appVersion).toBe('1.2.3');
        expect(report.userAgent).toBe('test-agent');
        expect(report.createdAt).toBe('2026-01-01T00:00:00.000Z');
        expect(report.logs).toHaveLength(1);
        expect(report.screenshots).toEqual(['data:image/png;base64,x']);
        expect(report.gameFiles[STORAGE_KEYS.CURRENT_PROFILE]).toBe('2');
    });

    it('omits logs when the user opts out', () => {
        addLogEntry('error', ['kaboom']);
        const report = buildBugReport({
            description: 'x',
            includeLogs: false,
            storage: makeStorage(),
        });
        expect(report.logs).toEqual([]);
    });
});

describe('sendBugReport', () => {
    it('POSTs the report as JSON', async () => {
        const transport = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await sendBugReport('http://localhost:8787/report', { description: 'x' }, { transport });

        expect(transport).toHaveBeenCalledWith(
            'http://localhost:8787/report',
            expect.objectContaining({ method: 'POST' }),
        );
        const body = JSON.parse(transport.mock.calls[0][1].body);
        expect(body.description).toBe('x');
    });

    it('throws on a non-ok response', async () => {
        const transport = vi.fn().mockResolvedValue({ ok: false, status: 500 });
        await expect(sendBugReport('http://x', {}, { transport })).rejects.toThrow(/500/);
    });

    it('throws when no endpoint is configured', async () => {
        await expect(sendBugReport('', {})).rejects.toThrow(/No bug report endpoint/);
    });
});

describe('fileToDataUrl', () => {
    it('reads a file as a data URL', async () => {
        const file = new File(['hello'], 'shot.txt', { type: 'text/plain' });
        const result = await fileToDataUrl(file);
        expect(result).toContain('data:text/plain');
    });
});
