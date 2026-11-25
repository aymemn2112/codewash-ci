import { describe, expect, it, vi } from 'vitest';

// On remplace seulement les listes de mobs ; tout le reste de gameData reste réel.
vi.mock('../constants/gameData', async (importOriginal) => ({
    ...(await importOriginal()),
    HOSTILE_MOBS: { Creeper: {} },
    FRIENDLY_MOBS: {},
    MINIBOSS_MOBS: {},
    BOSS_MOBS: {},
}));

import { getRandomMob, getRandomFriendlyMob, getRandomMiniboss, getRandomBoss } from './gameUtils';

describe('fallbacks when the source pool is empty', () => {
    it('returns the default name for friendly, miniboss and boss', () => {
        expect(getRandomFriendlyMob()).toBe('Allay');
        expect(getRandomMiniboss()).toBe('Wither Skeleton');
        expect(getRandomBoss()).toBe('Wither');
    });

    it('getRandomMob returns Zombie when the exclusion empties the pool', () => {
        expect(getRandomMob('Creeper')).toBe('Zombie');
    });

    it('getRandomMob returns the only mob when nothing is excluded', () => {
        expect(getRandomMob()).toBe('Creeper');
    });
});
