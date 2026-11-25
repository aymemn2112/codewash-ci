import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateMobWithAura, getRandomAura } from './mobDisplayUtils';

afterEach(() => vi.restoreAllMocks());

describe('getRandomAura', () => {
    it('picks the first aura when random() is 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomAura()).toBe('rainbow');
    });

    it('picks the last aura when random() is just below 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        expect(getRandomAura()).toBe('nature');
    });

    it('draws exactly once', () => {
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
        getRandomAura();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

describe('generateMobWithAura', () => {
    it('builds the mob with its aura and display name', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(generateMobWithAura('Zombie', 'zombie.png')).toEqual({
            mobName: 'Zombie',
            mobSrc: 'zombie.png',
            aura: 'rainbow',
            displayName: 'Prismatic Zombie',
        });
    });

    it('uses the adjective of the drawn aura', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        const result = generateMobWithAura('Creeper', 'creeper.png');
        expect(result.aura).toBe('nature');
        expect(result.displayName).toBe('Overgrown Creeper');
    });
});

describe('injected rng', () => {
    it('getRandomAura uses the given rng instead of Math.random', () => {
        const spy = vi.spyOn(Math, 'random');
        expect(getRandomAura(() => 0)).toBe('rainbow');
        expect(getRandomAura(() => 0.999)).toBe('nature');
        expect(spy).not.toHaveBeenCalled();
    });

    it('generateMobWithAura forwards the rng to getRandomAura', () => {
        const spy = vi.spyOn(Math, 'random');
        const result = generateMobWithAura('Zombie', 'zombie.png', () => 0);
        expect(result.aura).toBe('rainbow');
        expect(result.displayName).toBe('Prismatic Zombie');
        expect(spy).not.toHaveBeenCalled();
    });
});
