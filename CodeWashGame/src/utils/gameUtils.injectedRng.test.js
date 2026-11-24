import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    generateMathProblem,
    getItemsForLength,
    getReadingWord,
    getWordForDifficulty,
} from './gameUtils';
import {
    FUNNY_LONG_WORDS,
    READING_WORDS,
    WRITING_DIFFICULTY_POOLS,
    WRITING_WORD_INDEX,
} from '../constants/gameData';

afterEach(() => vi.restoreAllMocks());

const sequence = (...values) => {
    let index = 0;
    return () => values[index++ % values.length];
};

describe('injected rng in content selection', () => {
    it('getReadingWord uses the given rng', () => {
        const spy = vi.spyOn(Math, 'random');
        expect(getReadingWord(7, () => 0)).toBe(FUNNY_LONG_WORDS[0]);
        expect(getReadingWord(1, () => 0)).toBe(READING_WORDS[3][0]);
        expect(spy).not.toHaveBeenCalled();
    });

    it('generateMathProblem uses the given rng in every branch', () => {
        const spy = vi.spyOn(Math, 'random');
        expect(generateMathProblem(7, () => 0)).toEqual({
            type: 'math',
            question: '((25 - 10) × 4 + 18) ÷ 2 - 7 = ?',
            answer: '32',
            isNightmare: true,
        });
        expect(generateMathProblem(6, () => 0)).toEqual({
            type: 'math',
            question: '3 + 4 × 2 = ?',
            answer: '11',
            isPemdas: true,
        });
        expect(generateMathProblem(4, sequence(0.9, 0, 0))).toEqual({
            type: 'math',
            question: '1 × 1 = ?',
            answer: '1',
        });
        expect(generateMathProblem(5, sequence(0.9, 0, 0))).toEqual({
            type: 'math',
            question: '1 ÷ 1 = ?',
            answer: '1',
        });
        expect(spy).not.toHaveBeenCalled();
    });

    it('getWordForDifficulty uses the given rng', () => {
        const spy = vi.spyOn(Math, 'random');
        const item = WRITING_DIFFICULTY_POOLS[1][0];
        expect(getWordForDifficulty(1, () => 0)).toEqual({
            word: item.word.toUpperCase(),
            displayName: item.displayName,
            image: item.imagePath,
        });
        expect(spy).not.toHaveBeenCalled();
    });

    it('getItemsForLength uses the given rng', () => {
        const spy = vi.spyOn(Math, 'random');
        const item = WRITING_WORD_INDEX.find((word) => word.length === 3);
        expect(getItemsForLength(3, () => 0)).toEqual({
            items: [{ word: item.word.toUpperCase(), length: item.length }],
            combinedAnswer: item.word.toUpperCase(),
            images: [item.imagePath],
        });
        expect(spy).not.toHaveBeenCalled();
    });
});
