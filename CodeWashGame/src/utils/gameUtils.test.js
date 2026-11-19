import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    getRandomMob,
    getRandomFriendlyMob,
    getRandomMiniboss,
    getRandomBoss,
    getEncounterType,
    getMobForSkill,
    getDifficultyMultiplier,
    calculateDamage,
    calculateMobHealth,
    getExpectedDifficulty,
    calculateXPReward,
    calculateXPToLevel,
    getReadingWord,
    generateMathProblem,
    getWordForDifficulty,
    getItemsForLength,
} from './gameUtils';
import {
    HOSTILE_MOBS,
    FRIENDLY_MOBS,
    MINIBOSS_MOBS,
    BOSS_MOBS,
    READING_WORDS,
    FUNNY_LONG_WORDS,
    WRITING_DIFFICULTY_POOLS,
} from '../constants/gameData';

afterEach(() => {
    vi.restoreAllMocks();
});

const evaluateQuestion = (question) => {
    const expression = question.replace('= ?', '').replaceAll('×', '*').replaceAll('÷', '/').trim();
    // Controlled test input: a generated arithmetic expression.
    return Number(Function(`"use strict"; return (${expression})`)());
};

describe('encounter cycle', () => {
    it('alternates hostile, miniboss and boss every 20 levels', () => {
        expect(getEncounterType(1)).toBe('hostile');
        expect(getEncounterType(9)).toBe('hostile');
        expect(getEncounterType(10)).toBe('miniboss');
        expect(getEncounterType(11)).toBe('hostile');
        expect(getEncounterType(19)).toBe('hostile');
        expect(getEncounterType(20)).toBe('boss');
        expect(getEncounterType(21)).toBe('hostile');
        expect(getEncounterType(30)).toBe('miniboss');
        expect(getEncounterType(40)).toBe('boss');
    });
});

describe('progression math', () => {
    it('scales difficulty by powers of three', () => {
        expect(getDifficultyMultiplier(1)).toBe(1);
        expect(getDifficultyMultiplier(2)).toBe(3);
        expect(getDifficultyMultiplier(3)).toBe(9);
        expect(getDifficultyMultiplier(7)).toBe(729);
    });

    it('deals base damage independent of player level', () => {
        expect(calculateDamage(1, 1)).toBe(12);
        expect(calculateDamage(50, 1)).toBe(12);
        expect(calculateDamage(1, 2)).toBe(36);
        expect(calculateDamage(99, 3)).toBe(108);
    });

    it('gives mobs five hits worth of health', () => {
        expect(calculateMobHealth(1)).toBe(60);
        expect(calculateMobHealth(2)).toBe(180);
        expect(calculateMobHealth(4)).toBe(1620);
    });

    it('unlocks expected difficulty every 20 levels, capped at 7', () => {
        expect(getExpectedDifficulty(1)).toBe(1);
        expect(getExpectedDifficulty(20)).toBe(1);
        expect(getExpectedDifficulty(21)).toBe(2);
        expect(getExpectedDifficulty(40)).toBe(2);
        expect(getExpectedDifficulty(41)).toBe(3);
        expect(getExpectedDifficulty(200)).toBe(7);
    });

    it('rewards the base XP at difficulty 1', () => {
        expect(calculateXPReward(1)).toBe(100);
        expect(calculateXPReward(2)).toBe(300);
        expect(calculateXPReward(1, 1)).toBe(100);
    });

    it('penalises playing below the expected difficulty', () => {
        const atExpected = calculateXPReward(2, 21);
        const below = calculateXPReward(1, 21);
        expect(atExpected).toBeGreaterThan(0);
        expect(below).toBeGreaterThan(0);
        expect(below).toBeLessThan(atExpected);
    });

    it('computes XP to level from level and expected difficulty', () => {
        expect(calculateXPToLevel(1)).toBe(100);
        expect(calculateXPToLevel(2)).toBe(300);
        expect(calculateXPToLevel(1, 1)).toBe(100);
        expect(calculateXPToLevel(2, 21)).toBe(Math.floor(100 * Math.pow(1.035, 20) * 3));
    });
});

describe('random content selection', () => {
    it('returns the first pool entry when random is 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomMob()).toBe(Object.keys(HOSTILE_MOBS)[0]);
        expect(getRandomFriendlyMob()).toBe(Object.keys(FRIENDLY_MOBS)[0]);
        expect(getRandomMiniboss()).toBe(Object.keys(MINIBOSS_MOBS)[0]);
        expect(getRandomBoss()).toBe(Object.keys(BOSS_MOBS)[0]);
    });

    it('never returns the excluded mob', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const excluded = Object.keys(HOSTILE_MOBS)[0];
        expect(getRandomMob(excluded)).not.toBe(excluded);
    });
});

describe('getMobForSkill', () => {
    const skill = (id) => ({ id });

    it('uses the cleaning chest rotation', () => {
        expect(getMobForSkill(skill('cleaning'), { level: 20 })).toBe('Ender Chest');
        expect(getMobForSkill(skill('cleaning'), { level: 5 })).toBe('Shulker Box');
        expect(typeof getMobForSkill(skill('cleaning'), { level: 1 })).toBe('string');
    });

    it('returns the stable mobs stored on the skill state', () => {
        expect(getMobForSkill(skill('memory'), { level: 1, memoryMob: 'Allay' })).toBe('Allay');
        expect(getMobForSkill(skill('reading'), { level: 1, readingMob: 'Zombie' })).toBe('Zombie');
        expect(getMobForSkill(skill('patterns'), { level: 2, patternMob: 'Creeper' })).toBe(
            'Creeper',
        );
        expect(getMobForSkill(skill('math'), { level: 3, mathMob: 'Skeleton' })).toBe('Skeleton');
    });

    it('returns the stored boss and miniboss on their levels', () => {
        expect(getMobForSkill(skill('math'), { level: 20, currentBoss: 'Wither' })).toBe('Wither');
        expect(getMobForSkill(skill('math'), { level: 10, currentMiniboss: 'Ravager' })).toBe(
            'Ravager',
        );
    });

    it('falls back to the current hostile mob when valid', () => {
        expect(getMobForSkill(skill('unknown'), { level: 1, currentMob: 'Zombie' })).toBe('Zombie');
    });
});

describe('reading words', () => {
    it('uses the funny long words on difficulty 7', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getReadingWord(7)).toBe(FUNNY_LONG_WORDS[0]);
    });

    it('uses the difficulty word pool otherwise', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getReadingWord(1)).toBe(READING_WORDS[3][0]);
        expect(typeof getReadingWord(5)).toBe('string');
    });
});

describe('math problem generation', () => {
    it('produces a problem whose answer matches its expression', () => {
        const values = [0.05, 0.85, 0.42, 0.67, 0.13, 0.95, 0.31, 0.58, 0.76, 0.21];
        let index = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => values[index++ % values.length]);

        for (let difficulty = 1; difficulty <= 7; difficulty++) {
            const problem = generateMathProblem(difficulty);
            expect(problem.type).toBe('math');
            expect(evaluateQuestion(problem.question)).toBe(Number(problem.answer));
        }
    });

    it('flags PEMDAS and nightmare difficulties', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(generateMathProblem(6).isPemdas).toBe(true);
        expect(generateMathProblem(7).isNightmare).toBe(true);
    });
});

describe('writing content', () => {
    it('returns an uppercased word from the matching pool', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const item = WRITING_DIFFICULTY_POOLS[1][0];
        expect(getWordForDifficulty(1)).toEqual({
            word: item.word.toUpperCase(),
            displayName: item.displayName,
            image: item.imagePath,
        });
    });

    it('maps difficulties 6 and 7 to the last pool', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getWordForDifficulty(7)).toEqual(getWordForDifficulty(5));
    });

    it('builds a writable item set for a target length', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const result = getItemsForLength(3);
        expect(result.combinedAnswer).toBe(result.combinedAnswer.toUpperCase());
        expect(result.items.length).toBeGreaterThan(0);
        expect(result.images.length).toBeGreaterThan(0);
    });
});
