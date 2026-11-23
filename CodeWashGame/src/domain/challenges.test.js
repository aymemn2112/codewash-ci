import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateChallenge } from './challenges';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('generateChallenge', () => {
    it('delegates math to the difficulty generator', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const challenge = generateChallenge('math', 1);
        expect(challenge.type).toBe('math');
        expect(typeof challenge.answer).toBe('string');
    });

    it('builds a Simon Says challenge for patterns', () => {
        expect(generateChallenge('patterns', 3)).toEqual({
            type: 'patterns',
            question: 'Simon Says!',
            answer: 'WIN',
        });
    });

    it('uses the word as both question and answer for reading', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const challenge = generateChallenge('reading', 1);
        expect(challenge.type).toBe('reading');
        expect(challenge.answer).toBe(challenge.question);
    });

    it('builds a writing challenge with an image and uppercase answer', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const challenge = generateChallenge('writing', 1);
        expect(challenge.type).toBe('writing');
        expect(challenge.answer).toBe(challenge.answer.toUpperCase());
        expect(challenge.images).toHaveLength(1);
        expect(challenge.displayName).toBeTruthy();
    });

    it('handles memory and fallback types', () => {
        expect(generateChallenge('memory', 1).answer).toBe('WIN');
        expect(generateChallenge('cleaning', 1)).toEqual({
            type: 'manual',
            question: 'Task Complete?',
            answer: 'yes',
        });
    });
});
