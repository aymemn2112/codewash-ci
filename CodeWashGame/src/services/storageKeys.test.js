import { describe, expect, it, vi } from 'vitest';
import {
    STORAGE_KEYS,
    getBorderColorKey,
    getBorderEffectKey,
    getStorageKey,
    migrateLegacySkills,
} from './storageKeys';

const memoryStorage = (initial = {}) => {
    const data = new Map(Object.entries(initial));
    return {
        getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
        setItem: vi.fn((key, value) => data.set(key, value)),
    };
};

describe('storage keys', () => {
    it('exposes the existing versioned keys', () => {
        expect(STORAGE_KEYS.CURRENT_PROFILE).toBe('currentProfile_v1');
        expect(STORAGE_KEYS.PROFILE_NAMES).toBe('heroProfileNames_v1');
        expect(STORAGE_KEYS.PARENT_STATUS).toBe('heroParentStatus_v1');
        expect(STORAGE_KEYS.LEGACY_SKILLS).toBe('heroSkills_v23');
        expect(STORAGE_KEYS.PHANTOM_LAST_SPAWN).toBe('phantomEvent_lastSpawn_v1');
        expect(STORAGE_KEYS.LOCALE).toBe('heroLocale_v1');
    });

    it('builds the per-profile keys', () => {
        expect(getStorageKey(1)).toBe('heroSkills_v23_p1');
        expect(getStorageKey(3)).toBe('heroSkills_v23_p3');
        expect(getBorderEffectKey(2)).toBe('borderEffect_p2');
        expect(getBorderColorKey(2)).toBe('borderColor_p2');
    });
});

describe('migrateLegacySkills', () => {
    it('copies the legacy value to the target profile', () => {
        const storage = memoryStorage({ heroSkills_v23: '{"math":{}}' });

        expect(migrateLegacySkills(storage)).toBe(true);
        expect(storage.setItem).toHaveBeenCalledWith('heroSkills_v23_p1', '{"math":{}}');
    });

    it('leaves an existing target untouched', () => {
        const storage = memoryStorage({
            heroSkills_v23: 'legacy',
            heroSkills_v23_p1: 'current',
        });

        expect(migrateLegacySkills(storage)).toBe(false);
        expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('does nothing when the legacy key is missing', () => {
        const storage = memoryStorage();

        expect(migrateLegacySkills(storage, 2)).toBe(false);
        expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('can migrate to another profile', () => {
        const storage = memoryStorage({ heroSkills_v23: 'legacy' });

        expect(migrateLegacySkills(storage, 2)).toBe(true);
        expect(storage.setItem).toHaveBeenCalledWith('heroSkills_v23_p2', 'legacy');
    });
});
