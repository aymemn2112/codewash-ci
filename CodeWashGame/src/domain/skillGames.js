/**
 * Pure helpers for the mini-games inside SkillCard.
 * Randomness is injectable so the games can be tested deterministically.
 */

/** Fisher-Yates shuffle returning a new array. */
export const shuffle = (items, rng = Math.random) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

/** Pick one element at random. */
export const pickRandom = (items, rng = Math.random) => items[Math.floor(rng() * items.length)];

/**
 * Build the memory game deck: pick `pairs` friendly mobs, duplicate them and
 * shuffle. Each card gets a stable id, its mob key as `color`, and its image.
 */
export const buildMemoryDeck = (friendlyMobs, pairs, rng = Math.random) => {
    const selected = shuffle(Object.keys(friendlyMobs), rng).slice(0, pairs);
    return shuffle([...selected, ...selected], rng).map((mobKey, id) => ({
        id,
        color: mobKey,
        img: friendlyMobs[mobKey],
    }));
};

/**
 * Compute the next Simon Says sequence.
 * `reset` (difficulty 7) regenerates a fresh sequence one step longer instead
 * of appending to the current one.
 */
export const nextSimonSequence = (sequence, colors, { reset = false, rng = Math.random } = {}) => {
    if (reset) {
        return Array.from({ length: sequence.length + 1 }, () => pickRandom(colors, rng));
    }
    return [...sequence, pickRandom(colors, rng)];
};
