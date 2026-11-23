import { getEncounterType } from '../utils/gameUtils';

/**
 * Pick the aura stored on the skill state for the current encounter.
 * Memory and Cleaning have no aura; boss/miniboss use their dedicated aura;
 * combat skills use the aura attached to their current mob.
 */
export const getAuraForSkill = (skillConfig, userSkill) => {
    if (skillConfig.id === 'memory' || skillConfig.id === 'cleaning') {
        return null;
    }

    const encounterType = getEncounterType(userSkill.level);

    if (encounterType === 'boss') {
        return userSkill.currentBossAura;
    }

    if (encounterType === 'miniboss') {
        return userSkill.currentMinibossAura;
    }

    const combatSkillAuras = {
        reading: userSkill.readingMobAura,
        math: userSkill.mathMobAura,
        writing: userSkill.writingMobAura,
        patterns: userSkill.patternMobAura,
    };

    return combatSkillAuras[skillConfig.id] || null;
};

export default getAuraForSkill;
