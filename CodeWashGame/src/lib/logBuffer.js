import { defaultClock } from '../services/clock';

const MAX_ENTRIES = 200;

let entries = [];

const stringify = (value) => {
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

/** Record one log line in the ring buffer used by bug reports. */
export const addLogEntry = (level, args) => {
    const message = args.map(stringify).join(' ');
    entries = [...entries, { at: defaultClock().toISOString(), level, message }].slice(
        -MAX_ENTRIES,
    );
};

export const getLogEntries = () => entries;

export const clearLogEntries = () => {
    entries = [];
};

export const LOG_BUFFER_LIMIT = MAX_ENTRIES;
