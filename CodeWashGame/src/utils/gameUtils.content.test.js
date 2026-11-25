import { afterEach, describe, expect, it, vi } from 'vitest';

// On neutralise seulement deux entrées de gameData ; tout le reste reste réel.
vi.mock('../constants/gameData', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        DIFFICULTY_CONTENT: {
            ...original.DIFFICULTY_CONTENT,
            math: {
                ...original.DIFFICULTY_CONTENT.math,
                1: { operations: ['?'], range: [1, 9] },
            },
        },
        WRITING_DIFFICULTY_POOLS: {
            ...original.WRITING_DIFFICULTY_POOLS,
            2: [],
        },
    };
});

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

describe('getReadingWord', () => {
    it('picks from the funny list on difficulty 7', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getReadingWord(7)).toBe(FUNNY_LONG_WORDS[0]);
    });

    it('picks from the char-length pool otherwise', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getReadingWord(1)).toBe(READING_WORDS[3][0]);
    });
});

describe('generateMathProblem', () => {
    it('picks the first nightmare problem', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(generateMathProblem(7)).toEqual({
            type: 'math',
            question: '((25 - 10) × 4 + 18) ÷ 2 - 7 = ?',
            answer: '32',
            isNightmare: true,
        });
    });

    it('picks the first PEMDAS problem', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(generateMathProblem(6)).toEqual({
            type: 'math',
            question: '3 + 4 × 2 = ?',
            answer: '11',
            isPemdas: true,
        });
    });

    it('generates a multiplication for difficulty 4', () => {
        vi.spyOn(Math, 'random').mockImplementation(sequence(0.9, 0, 0));
        expect(generateMathProblem(4)).toEqual({
            type: 'math',
            question: '1 × 1 = ?',
            answer: '1',
        });
    });

    it('generates a division for difficulty 5', () => {
        vi.spyOn(Math, 'random').mockImplementation(sequence(0.9, 0, 0));
        expect(generateMathProblem(5)).toEqual({
            type: 'math',
            question: '1 ÷ 1 = ?',
            answer: '1',
        });
    });

    it('falls back to addition for an unknown operation', () => {
        vi.spyOn(Math, 'random').mockImplementation(sequence(0, 0, 0));
        expect(generateMathProblem(1)).toEqual({
            type: 'math',
            question: '1 + 1 = ?',
            answer: '2',
        });
    });
});

describe('getWordForDifficulty', () => {
    it('picks the first word of the pool', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const item = WRITING_DIFFICULTY_POOLS[1][0];
        expect(getWordForDifficulty(1)).toEqual({
            word: item.word.toUpperCase(),
            displayName: item.displayName,
            image: item.imagePath,
        });
    });

    it('falls back to pool 1 when the pool is empty', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const item = WRITING_DIFFICULTY_POOLS[1][0];
        expect(getWordForDifficulty(2)).toEqual({
            word: item.word.toUpperCase(),
            displayName: item.displayName,
            image: item.imagePath,
        });
    });
});

describe('getItemsForLength', () => {
    it('picks an exact-length item', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const item = WRITING_WORD_INDEX.find((word) => word.length === 3);
        expect(getItemsForLength(3)).toEqual({
            items: [{ word: item.word.toUpperCase(), length: item.length }],
            combinedAnswer: item.word.toUpperCase(),
            images: [item.imagePath],
        });
    });

    it('combines two spelling items when no exact match exists', () => {
        const spy = vi.spyOn(Math, 'random');
        const result = getItemsForLength(16);
        expect(result.items.map((item) => item.word)).toEqual(['DIAMOND', 'NETHERITE']);
        expect(result.combinedAnswer).toBe('DIAMONDNETHERITE');
        expect(spy).not.toHaveBeenCalled();
    });

    it('falls back to the closest word', () => {
        const spy = vi.spyOn(Math, 'random');
        const expected = [...WRITING_WORD_INDEX].sort(
            (a, b) => Math.abs(a.length - 999) - Math.abs(b.length - 999),
        )[0];
        expect(getItemsForLength(999)).toEqual({
            items: [{ word: expected.word.toUpperCase(), length: expected.length }],
            combinedAnswer: expected.word.toUpperCase(),
            images: [expected.imagePath],
        });
        expect(spy).not.toHaveBeenCalled();
    });
});
