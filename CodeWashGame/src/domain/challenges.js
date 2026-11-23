import { generateMathProblem, getReadingWord, getWordForDifficulty } from '../utils/gameUtils';

/**
 * Build the challenge payload for a skill type at a given difficulty.
 * Pure: the randomness lives in the content generators in gameUtils.
 */
export const generateChallenge = (type, diff) => {
    if (type === 'math') {
        return generateMathProblem(diff);
    }

    if (type === 'patterns') {
        return { type: 'patterns', question: 'Simon Says!', answer: 'WIN' };
    }

    if (type === 'reading') {
        const word = getReadingWord(diff);
        return { type, question: word, answer: word };
    }

    if (type === 'writing') {
        const wordData = getWordForDifficulty(diff);
        return {
            type,
            question: 'Spell it!',
            answer: wordData.displayName.toUpperCase(),
            images: [wordData.image],
            displayName: wordData.displayName,
        };
    }

    if (type === 'memory') {
        return { type: 'memory', question: 'Find Pairs!', answer: 'WIN' };
    }

    return { type: 'manual', question: 'Task Complete?', answer: 'yes' };
};

export default generateChallenge;
