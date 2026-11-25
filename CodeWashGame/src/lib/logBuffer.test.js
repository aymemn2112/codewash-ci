import { describe, it, expect, afterEach } from 'vitest';
import { addLogEntry, getLogEntries, clearLogEntries, LOG_BUFFER_LIMIT } from './logBuffer';

afterEach(() => {
    clearLogEntries();
});

describe('logBuffer', () => {
    it('records entries with level and message', () => {
        addLogEntry('warn', ['careful', 42]);
        const entries = getLogEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0].level).toBe('warn');
        expect(entries[0].message).toBe('careful 42');
        expect(typeof entries[0].at).toBe('string');
    });

    it('serialises errors and objects', () => {
        addLogEntry('error', [new Error('boom')]);
        addLogEntry('log', [{ a: 1 }]);
        const entries = getLogEntries();
        expect(entries[0].message).toContain('Error: boom');
        expect(entries[1].message).toBe('{"a":1}');
    });

    it('keeps only the most recent entries', () => {
        for (let i = 0; i < LOG_BUFFER_LIMIT + 5; i++) {
            addLogEntry('log', [`entry ${i}`]);
        }
        const entries = getLogEntries();
        expect(entries).toHaveLength(LOG_BUFFER_LIMIT);
        expect(entries[entries.length - 1].message).toBe(`entry ${LOG_BUFFER_LIMIT + 4}`);
    });
});
