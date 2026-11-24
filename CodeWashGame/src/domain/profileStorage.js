import { SKILL_DATA, DEFAULT_THEME_ID, normalizeThemeId } from '../constants/gameData';
import {
    getRandomMob,
    getRandomFriendlyMob,
    getRandomMiniboss,
    getRandomBoss,
    calculateMobHealth,
} from '../utils/gameUtils';
import { getRandomAura } from '../utils/mobDisplayUtils';
import { getDefaultStats } from '../utils/achievementUtils';
import { recordLoadError } from '../lib/loadErrors';
import { logger } from '../lib/logger';

const LEGACY_KEY = 'heroSkills_v23';

export const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;

/** Read the raw profile JSON, falling back to the legacy profile-1 key. */
const readRawProfile = (profileId) => {
    let saved = localStorage.getItem(getStorageKey(profileId));
    if (!saved && profileId === 1) saved = localStorage.getItem(LEGACY_KEY);
    return saved;
};

/** Fresh skill state, with random mobs/auras, then merged with saved data. */
export const loadSkills = (profileId) => {
    const initial = {};
    SKILL_DATA.forEach((skill) => {
        const initialDifficulty = 1;
        initial[skill.id] = {
            level: 1,
            xp: 0,
            currentMob: getRandomMob(null),
            difficulty: initialDifficulty,
            earnedBadges: [],
            mobHealth: calculateMobHealth(initialDifficulty),
            mobMaxHealth: calculateMobHealth(initialDifficulty),
            lostLevel: false,
            recoveryDifficulty: null,
            memoryMob: skill.id === 'memory' ? getRandomFriendlyMob() : null,
            patternMob: skill.id === 'patterns' ? getRandomMob(null) : null,
            currentMiniboss: getRandomMiniboss(),
            currentBoss: getRandomBoss(),
            readingMob: skill.id === 'reading' ? getRandomMob(null) : null,
            mathMob: skill.id === 'math' ? getRandomMob(null) : null,
            writingMob: skill.id === 'writing' ? getRandomMob(null) : null,
            readingMobAura: skill.id === 'reading' ? getRandomAura() : null,
            mathMobAura: skill.id === 'math' ? getRandomAura() : null,
            writingMobAura: skill.id === 'writing' ? getRandomAura() : null,
            patternMobAura: skill.id === 'patterns' ? getRandomAura() : null,
            currentMinibossAura: getRandomAura(),
            currentBossAura: getRandomAura(),
        };
    });

    const saved = readRawProfile(profileId);
    try {
        if (saved) {
            const parsed = JSON.parse(saved);
            const data = parsed.skills || parsed;
            Object.keys(data).forEach((key) => {
                initial[key] = { ...initial[key], ...data[key] };

                if (typeof initial[key].difficulty !== 'number') initial[key].difficulty = 1;
                if (!Array.isArray(initial[key].earnedBadges)) initial[key].earnedBadges = [];
                if (typeof initial[key].mobHealth !== 'number') {
                    const diff = initial[key].difficulty || 1;
                    initial[key].mobHealth = calculateMobHealth(diff);
                    initial[key].mobMaxHealth = calculateMobHealth(diff);
                }
                if (typeof initial[key].lostLevel !== 'boolean') initial[key].lostLevel = false;
                if (initial[key].recoveryDifficulty === undefined) {
                    initial[key].recoveryDifficulty = null;
                }
                if (key === 'memory' && !initial[key].memoryMob) {
                    initial[key].memoryMob = getRandomFriendlyMob();
                }
                if (key === 'patterns' && !initial[key].patternMob) {
                    initial[key].patternMob = getRandomMob(null);
                }
                if (key === 'reading' && !initial[key].readingMob) {
                    initial[key].readingMob = getRandomMob(null);
                }
                if (key === 'math' && !initial[key].mathMob) {
                    initial[key].mathMob = getRandomMob(null);
                }
                if (key === 'writing' && !initial[key].writingMob) {
                    initial[key].writingMob = getRandomMob(null);
                }
                if (key === 'reading' && !initial[key].readingMobAura) {
                    initial[key].readingMobAura = getRandomAura();
                }
                if (key === 'math' && !initial[key].mathMobAura) {
                    initial[key].mathMobAura = getRandomAura();
                }
                if (key === 'writing' && !initial[key].writingMobAura) {
                    initial[key].writingMobAura = getRandomAura();
                }
                if (key === 'patterns' && !initial[key].patternMobAura) {
                    initial[key].patternMobAura = getRandomAura();
                }
                if (key !== 'cleaning' && key !== 'memory') {
                    if (!initial[key].currentMiniboss) {
                        initial[key].currentMiniboss = getRandomMiniboss();
                    }
                    if (!initial[key].currentBoss) initial[key].currentBoss = getRandomBoss();
                    if (!initial[key].currentMinibossAura) {
                        initial[key].currentMinibossAura = getRandomAura();
                    }
                    if (!initial[key].currentBossAura) {
                        initial[key].currentBossAura = getRandomAura();
                    }
                }
            });
            return initial;
        }
    } catch (e) {
        recordLoadError('skills');
        logger.warn('Failed to parse saved skills:', e);
    }
    return initial;
};

export const loadTheme = (profileId) => {
    const saved = readRawProfile(profileId);
    try {
        return normalizeThemeId(JSON.parse(saved).theme || DEFAULT_THEME_ID);
    } catch (e) {
        recordLoadError('theme');
        logger.warn('Failed to parse theme:', e);
    }
    return DEFAULT_THEME_ID;
};

export const loadStats = (profileId) => {
    const saved = readRawProfile(profileId);
    try {
        const data = JSON.parse(saved);
        if (data.stats) {
            return { ...getDefaultStats(), ...data.stats };
        }
    } catch (e) {
        recordLoadError('stats');
        logger.warn('Failed to parse stats:', e);
    }
    return getDefaultStats();
};

export const getProfileStats = (id, liveSkills = null, activeTheme = DEFAULT_THEME_ID) => {
    if (liveSkills) {
        let totalLevel = 0;
        let highestLevel = 0;
        Object.values(liveSkills).forEach((s) => {
            if (s && typeof s.level === 'number') {
                totalLevel += s.level;
                if (s.level > highestLevel) highestLevel = s.level;
            }
        });
        return { totalLevel, highestLevel, skills: liveSkills, theme: activeTheme };
    }

    const saved = readRawProfile(id);
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        const skillsData = data.skills || data;
        const theme = normalizeThemeId(data.theme || DEFAULT_THEME_ID);
        let totalLevel = 0;
        let highestLevel = 0;
        Object.values(skillsData).forEach((s) => {
            if (s && typeof s.level === 'number') {
                totalLevel += s.level;
                if (s.level > highestLevel) highestLevel = s.level;
            }
        });
        return { totalLevel, highestLevel, skills: skillsData, theme };
    } catch (e) {
        recordLoadError('profile stats');
        logger.warn('Failed to parse profile stats:', e);
        return null;
    }
};
