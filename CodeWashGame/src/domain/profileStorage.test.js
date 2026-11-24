import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStorageKey, loadSkills, loadTheme, loadStats, getProfileStats } from './profileStorage';
import { SKILL_DATA } from '../constants/gameData';
import { getDefaultStats } from '../utils/achievementUtils';
import { getLoadErrors } from '../lib/loadErrors';

beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getStorageKey', () => {
    it('builds the versioned per-profile key', () => {
        expect(getStorageKey(2)).toBe('heroSkills_v23_p2');
    });
});

describe('loadTheme', () => {
    it('defaults to classic when nothing is saved', () => {
        expect(loadTheme(1)).toBe('classic');
    });

    it('reads a saved theme', () => {
        localStorage.setItem(getStorageKey(1), JSON.stringify({ theme: 'kpop' }));
        expect(loadTheme(1)).toBe('kpop');
    });

    it('migrates the legacy theme id', () => {
        localStorage.setItem(getStorageKey(1), JSON.stringify({ theme: 'minecraft' }));
        expect(loadTheme(1)).toBe('classic');
    });
});

describe('loadStats', () => {
    it('returns defaults when nothing is saved', () => {
        expect(loadStats(1)).toEqual(getDefaultStats());
    });

    it('merges saved stats over defaults', () => {
        localStorage.setItem(getStorageKey(1), JSON.stringify({ stats: { totalMobsDefeated: 7 } }));
        const stats = loadStats(1);
        expect(stats.totalMobsDefeated).toBe(7);
        expect(stats.phantomsCaught).toBe(0);
    });

    it('records a load error on corrupt data', () => {
        localStorage.setItem(getStorageKey(1), '{ broken');
        expect(loadStats(1)).toEqual(getDefaultStats());
        expect(getLoadErrors()).toContain('stats');
    });
});

describe('loadSkills', () => {
    it('initialises every skill at level 1', () => {
        const skills = loadSkills(1);
        expect(Object.keys(skills)).toHaveLength(SKILL_DATA.length);
        SKILL_DATA.forEach((skill) => {
            expect(skills[skill.id].level).toBe(1);
        });
    });

    it('merges saved skill progress', () => {
        localStorage.setItem(getStorageKey(1), JSON.stringify({ skills: { math: { level: 5 } } }));
        const skills = loadSkills(1);
        expect(skills.math.level).toBe(5);
        expect(typeof skills.math.mobHealth).toBe('number');
    });

    it('records a load error on corrupt data', () => {
        localStorage.setItem(getStorageKey(1), '{ broken');
        expect(() => loadSkills(1)).not.toThrow();
        expect(getLoadErrors()).toContain('skills');
    });
});

describe('getProfileStats', () => {
    it('returns null when there is no saved profile', () => {
        expect(getProfileStats(1)).toBeNull();
    });

    it('summarises live skills', () => {
        const live = { math: { level: 3 }, reading: { level: 4 } };
        expect(getProfileStats(1, live, 'spy')).toEqual({
            totalLevel: 7,
            highestLevel: 4,
            skills: live,
            theme: 'spy',
        });
    });

    it('summarises a saved profile', () => {
        localStorage.setItem(
            getStorageKey(1),
            JSON.stringify({
                theme: 'kpop',
                skills: { math: { level: 2 }, reading: { level: 5 } },
            }),
        );
        expect(getProfileStats(1)).toEqual({
            totalLevel: 7,
            highestLevel: 5,
            skills: { math: { level: 2 }, reading: { level: 5 } },
            theme: 'kpop',
        });
    });
});
