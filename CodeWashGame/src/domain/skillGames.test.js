import { describe, it, expect } from 'vitest';
import { shuffle, pickRandom, buildMemoryDeck, nextSimonSequence } from './skillGames';

describe('shuffle', () => {
    it('keeps every element', () => {
        const rng = () => 0.5;
        expect(shuffle([1, 2, 3, 4], rng).sort()).toEqual([1, 2, 3, 4]);
    });

    it('does not mutate the input', () => {
        const input = [1, 2, 3];
        shuffle(input, () => 0.5);
        expect(input).toEqual([1, 2, 3]);
    });
});

describe('pickRandom', () => {
    it('returns an element of the list', () => {
        expect(pickRandom(['a', 'b', 'c'], () => 0)).toBe('a');
        expect(pickRandom(['a', 'b', 'c'], () => 0.99)).toBe('c');
    });
});

describe('buildMemoryDeck', () => {
    const mobs = { A: 'a.png', B: 'b.png', C: 'c.png', D: 'd.png' };

    it('builds two cards per selected pair', () => {
        const deck = buildMemoryDeck(mobs, 2, () => 0);
        expect(deck).toHaveLength(4);
        const colors = deck.map((card) => card.color);
        expect(new Set(colors).size).toBe(2);
        expect(colors.filter((c) => c === colors[0])).toHaveLength(2);
    });

    it('attaches a stable id and an image', () => {
        const deck = buildMemoryDeck(mobs, 2, () => 0);
        deck.forEach((card, index) => {
            expect(card.id).toBe(index);
            expect(card.img).toBe(mobs[card.color]);
        });
    });
});

describe('nextSimonSequence', () => {
    it('appends one colour in normal mode', () => {
        expect(nextSimonSequence(['x'], ['a', 'b'], { rng: () => 0 })).toEqual(['x', 'a']);
    });

    it('regenerates a longer sequence in reset mode', () => {
        const next = nextSimonSequence(['x', 'y'], ['a'], { reset: true, rng: () => 0 });
        expect(next).toEqual(['a', 'a', 'a']);
    });
});
