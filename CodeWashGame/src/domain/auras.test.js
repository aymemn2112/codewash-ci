import { describe, it, expect } from 'vitest';
import { getAuraForSkill } from './auras';

const skill = (id) => ({ id });

describe('getAuraForSkill', () => {
    it('returns null for memory and cleaning', () => {
        expect(getAuraForSkill(skill('memory'), { level: 1 })).toBeNull();
        expect(getAuraForSkill(skill('cleaning'), { level: 1 })).toBeNull();
    });

    it('uses the boss aura on boss levels', () => {
        expect(
            getAuraForSkill(skill('math'), {
                level: 20,
                currentBossAura: 'boss-aura',
            }),
        ).toBe('boss-aura');
    });

    it('uses the miniboss aura on miniboss levels', () => {
        expect(
            getAuraForSkill(skill('reading'), {
                level: 10,
                currentMinibossAura: 'mini-aura',
            }),
        ).toBe('mini-aura');
    });

    it('uses the per-mob aura for combat skills', () => {
        const state = {
            level: 1,
            readingMobAura: 'reading-aura',
            mathMobAura: 'math-aura',
            writingMobAura: 'writing-aura',
            patternMobAura: 'pattern-aura',
        };
        expect(getAuraForSkill(skill('reading'), state)).toBe('reading-aura');
        expect(getAuraForSkill(skill('math'), state)).toBe('math-aura');
        expect(getAuraForSkill(skill('writing'), state)).toBe('writing-aura');
        expect(getAuraForSkill(skill('patterns'), state)).toBe('pattern-aura');
    });

    it('falls back to null for unknown skills', () => {
        expect(getAuraForSkill(skill('unknown'), { level: 1 })).toBeNull();
    });
});
