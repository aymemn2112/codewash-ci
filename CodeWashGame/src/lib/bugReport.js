import { defaultClock } from '../services/clock';
import { getLogEntries } from './logBuffer';
import {
    STORAGE_KEYS,
    getStorageKey,
    getBorderEffectKey,
    getBorderColorKey,
} from '../services/storageKeys';

export const BUG_REPORT_SCHEMA = 1;

/** Snapshot the saved game data (raw JSON strings) for the report. */
export const collectGameFiles = (storage, profileIds = [1, 2, 3]) => {
    const keys = [
        ...Object.values(STORAGE_KEYS),
        ...profileIds.flatMap((id) => [
            getStorageKey(id),
            getBorderEffectKey(id),
            getBorderColorKey(id),
        ]),
    ];

    const files = {};
    for (const key of keys) {
        const value = storage.getItem(key);
        if (value !== null && value !== undefined) files[key] = value;
    }
    return files;
};

/** Read a File into a data URL so it can travel in the JSON payload. */
export const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Failed to read screenshot'));
        reader.readAsDataURL(file);
    });

export const buildBugReport = ({
    description,
    steps = '',
    includeLogs = true,
    screenshots = [],
    storage,
    userAgent = '',
    appVersion = 'unknown',
    now = defaultClock,
}) => ({
    schemaVersion: BUG_REPORT_SCHEMA,
    createdAt: now().toISOString(),
    appVersion,
    userAgent,
    description: description.trim(),
    steps: steps.trim(),
    logs: includeLogs ? getLogEntries() : [],
    screenshots,
    gameFiles: collectGameFiles(storage),
});

/** POST the report as JSON to the configured endpoint. */
export const sendBugReport = async (endpoint, report, { transport = fetch } = {}) => {
    if (!endpoint) throw new Error('No bug report endpoint configured');

    const response = await transport(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
    });

    if (!response || !response.ok) {
        throw new Error(`Bug report rejected (HTTP ${response?.status ?? 'unknown'})`);
    }
    return true;
};
