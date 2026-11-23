/** Tempo curve for the Simon Says (patterns) mini-game. */

export const MAX_TEMPO_DELAY = 800; // Slowest tempo (difficulty 1, round 1)
export const MIN_TEMPO_DELAY = 200; // Fastest tempo (difficulty 7, always)

/** Clamp a value between min and max. */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Linear interpolation from start to end with t clamped to [0, 1]. */
export const lerp = (start, end, t) => start + (end - start) * clamp(t, 0, 1);

/**
 * Calculate the on/off delays for a round.
 * Difficulty scales both the starting delay and the acceleration runway.
 */
export const getTempoDelays = (completedRounds, currentDifficulty) => {
    const round = completedRounds + 1;

    const startingDelay = lerp(MAX_TEMPO_DELAY, MIN_TEMPO_DELAY, (currentDifficulty - 1) / 6);
    const maxRunwayRounds = lerp(10, 1, (currentDifficulty - 1) / 6);

    const runwayProgress = maxRunwayRounds > 1 ? (round - 1) / (maxRunwayRounds - 1) : 1;
    const rawOnDelay = lerp(startingDelay, MIN_TEMPO_DELAY, runwayProgress);
    const onDelay = clamp(rawOnDelay, MIN_TEMPO_DELAY, MAX_TEMPO_DELAY);

    // offDelay is ~35% of onDelay with a 100ms floor
    const offDelay = Math.max(100, Math.round(onDelay * 0.35));

    return { onDelay, offDelay };
};
