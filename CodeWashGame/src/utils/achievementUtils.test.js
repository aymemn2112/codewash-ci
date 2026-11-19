import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    getDefaultStats,
    isAchievementUnlocked,
    getCurrentTier,
    getNextTier,
    getTierProgress,
    getNewlyUnlockedAchievements,
    getNewTierAchievements,
    addUniqueToArray,
    recordLoginDate,
    getAchievementDisplayName,
} from './achievementUtils';

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

const skillsAtLevel = (level) => ({
    reading: { level },
    math: { level },
    writing: { level },
    cleaning: { level },
    memory: { level },
    patterns: { level },
});

describe('getDefaultStats', () => {
    it('returns the complete zeroed stats structure', () => {
        expect(getDefaultStats()).toEqual({
            phantomsCaught: 0,
            totalMobsDefeated: 0,
            totalBossesDefeated: 0,
            totalMinibossesDefeated: 0,
            totalDeaths: 0,
            uniqueMobsDefeated: [],
            uniqueBossesDefeated: [],
            uniqueMinibossesDefeated: [],
            themeChanges: 0,
            borderChanges: 0,
            battlesThisSession: 0,
            loginDates: [],
            perfectMemoryGames: 0,
            achievementsUnlocked: [],
        });
    });
});

describe('isAchievementUnlocked', () => {
    it('returns false for unknown achievements', () => {
        expect(isAchievementUnlocked('nope', getDefaultStats(), {})).toBe(false);
    });

    it('evaluates one-time achievements', () => {
        expect(isAchievementUnlocked('first_steps', getDefaultStats(), {})).toBe(false);
        expect(
            isAchievementUnlocked(
                'first_steps',
                { ...getDefaultStats(), totalMobsDefeated: 1 },
                {},
            ),
        ).toBe(true);
    });

    it('unlocks a tiered achievement at its first tier', () => {
        expect(
            isAchievementUnlocked(
                'phantom_hunter',
                { ...getDefaultStats(), phantomsCaught: 4 },
                {},
            ),
        ).toBe(false);
        expect(
            isAchievementUnlocked(
                'phantom_hunter',
                { ...getDefaultStats(), phantomsCaught: 5 },
                {},
            ),
        ).toBe(true);
    });

    it('evaluates achievements that inspect skills', () => {
        expect(isAchievementUnlocked('level_up', getDefaultStats(), skillsAtLevel(1))).toBe(false);
        expect(isAchievementUnlocked('level_up', getDefaultStats(), skillsAtLevel(2))).toBe(true);
    });
});

describe('tiers', () => {
    it('returns -1 when no tier is reached or the achievement is not tiered', () => {
        expect(getCurrentTier('nope', getDefaultStats(), {})).toBe(-1);
        expect(getCurrentTier('first_steps', getDefaultStats(), {})).toBe(-1);
        expect(
            getCurrentTier('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 4 }, {}),
        ).toBe(-1);
    });

    it('returns the highest reached tier index', () => {
        expect(
            getCurrentTier('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 5 }, {}),
        ).toBe(0);
        expect(
            getCurrentTier('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 10 }, {}),
        ).toBe(1);
        expect(
            getCurrentTier('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 100 }, {}),
        ).toBe(7);
    });

    it('returns the next tier or null at the maximum', () => {
        expect(
            getNextTier('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 4 }, {}),
        ).toMatchObject({ level: 5 });
        expect(
            getNextTier('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 100 }, {}),
        ).toBeNull();
        expect(getNextTier('first_steps', getDefaultStats(), {})).toBeNull();
    });

    it('computes progress inside the current tier', () => {
        expect(
            getTierProgress('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 0 }, {}),
        ).toBe(0);
        expect(
            getTierProgress('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 5 }, {}),
        ).toBe(0);
        expect(
            getTierProgress('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 7 }, {}),
        ).toBe(40);
        expect(
            getTierProgress('phantom_hunter', { ...getDefaultStats(), phantomsCaught: 100 }, {}),
        ).toBe(100);
    });
});

describe('unlock transitions', () => {
    it('reports one-time achievements that just unlocked', () => {
        const skills = skillsAtLevel(1);
        const oldStats = getDefaultStats();
        const newStats = { ...oldStats, totalMobsDefeated: 1 };

        const unlocked = getNewlyUnlockedAchievements(oldStats, newStats, skills, skills);
        expect(unlocked).toContain('first_steps');
        expect(unlocked).not.toContain('level_up');
    });

    it('reports tiered achievements that advanced', () => {
        const skills = skillsAtLevel(1);
        const oldStats = { ...getDefaultStats(), phantomsCaught: 4 };
        const newStats = { ...oldStats, phantomsCaught: 5 };

        expect(getNewTierAchievements(oldStats, newStats, skills, skills)).toContainEqual({
            achievementId: 'phantom_hunter',
            tierIndex: 0,
        });
    });
});

describe('helpers', () => {
    it('adds unique values only', () => {
        expect(addUniqueToArray([], 'a')).toEqual(['a']);
        expect(addUniqueToArray(['a'], 'a')).toEqual(['a']);
        expect(addUniqueToArray(['a'], 'b')).toEqual(['a', 'b']);
    });

    it('records a login date once per day', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));

        expect(recordLoginDate([])).toEqual(['2025-01-15']);
        expect(recordLoginDate(['2025-01-15'])).toEqual(['2025-01-15']);

        vi.setSystemTime(new Date('2025-01-16T08:00:00Z'));
        expect(recordLoginDate(['2025-01-15'])).toEqual(['2025-01-15', '2025-01-16']);
    });

    it('builds display names with the current tier', () => {
        expect(getAchievementDisplayName('nope', getDefaultStats(), {})).toBe('');
        expect(getAchievementDisplayName('first_steps', getDefaultStats(), {})).toBe('First Steps');
        expect(
            getAchievementDisplayName(
                'phantom_hunter',
                { ...getDefaultStats(), phantomsCaught: 0 },
                {},
            ),
        ).toBe('Ghost Buster');
        expect(
            getAchievementDisplayName(
                'phantom_hunter',
                { ...getDefaultStats(), phantomsCaught: 5 },
                {},
            ),
        ).toBe('Bronze Ghost Buster');
        expect(
            getAchievementDisplayName(
                'phantom_hunter',
                { ...getDefaultStats(), phantomsCaught: 100 },
                {},
            ),
        ).toBe('Mythic Ghost Buster');
    });
});
