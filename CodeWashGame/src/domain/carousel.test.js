import { describe, it, expect } from 'vitest';
import { getVisibleItems } from './carousel';

const SKILLS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('getVisibleItems', () => {
    it('returns seven cards from -3 to +3', () => {
        const items = getVisibleItems(0, SKILLS);
        expect(items).toHaveLength(7);
        expect(items.map((item) => item.offset)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
        expect(items.map((item) => item.key)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
    });

    it('centres the selected skill at offset 0', () => {
        const items = getVisibleItems(1, SKILLS);
        expect(items.find((item) => item.offset === 0).id).toBe('b');
    });

    it('wraps around in both directions', () => {
        const items = getVisibleItems(0, SKILLS);
        expect(items.find((item) => item.offset === -1).id).toBe('c');
        expect(items.find((item) => item.offset === 3).id).toBe('a');
    });
});
