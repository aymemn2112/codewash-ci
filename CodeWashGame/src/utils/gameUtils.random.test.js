import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRandomMob, getRandomFriendlyMob, getRandomMiniboss, getRandomBoss } from './gameUtils';
import { HOSTILE_MOBS, FRIENDLY_MOBS, MINIBOSS_MOBS, BOSS_MOBS } from '../constants/gameData';

afterEach(() => vi.restoreAllMocks());

// Le même trio de tests, répété pour les 3 fonctions sans paramètre
describe.each([
    ['getRandomFriendlyMob', getRandomFriendlyMob, FRIENDLY_MOBS],
    ['getRandomMiniboss', getRandomMiniboss, MINIBOSS_MOBS],
    ['getRandomBoss', getRandomBoss, BOSS_MOBS],
])('%s', (_name, fn, source) => {
    const keys = Object.keys(source);

    it('picks the first key when random() is 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(fn()).toBe(keys[0]);
    });

    it('picks the last key when random() is just below 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        expect(fn()).toBe(keys[keys.length - 1]);
    });

    it('draws exactly once', () => {
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
        fn();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

// getRandomMob a un paramètre en plus : `exclude`
describe('getRandomMob', () => {
    const keys = Object.keys(HOSTILE_MOBS);

    it('picks the first key when random() is 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomMob()).toBe(keys[0]);
    });

    it('picks the last key when random() is just below 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        expect(getRandomMob()).toBe(keys[keys.length - 1]);
    });

    it('never returns the excluded mob', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomMob(keys[0])).toBe(keys[1]);
    });

    it('draws exactly once', () => {
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
        getRandomMob(null);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

describe('injected rng', () => {
    it('getRandomFriendlyMob, getRandomMiniboss and getRandomBoss use the given rng', () => {
        const spy = vi.spyOn(Math, 'random');
        expect(getRandomFriendlyMob(() => 0)).toBe(Object.keys(FRIENDLY_MOBS)[0]);
        expect(getRandomMiniboss(() => 0)).toBe(Object.keys(MINIBOSS_MOBS)[0]);
        expect(getRandomBoss(() => 0.999)).toBe(Object.keys(BOSS_MOBS).at(-1));
        expect(spy).not.toHaveBeenCalled();
    });

    it('getRandomMob uses the given rng and still honours exclude', () => {
        const keys = Object.keys(HOSTILE_MOBS);
        const spy = vi.spyOn(Math, 'random');
        expect(getRandomMob(null, () => 0)).toBe(keys[0]);
        expect(getRandomMob(keys[0], () => 0)).toBe(keys[1]);
        expect(spy).not.toHaveBeenCalled();
    });
});
