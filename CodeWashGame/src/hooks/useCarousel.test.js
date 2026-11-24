import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarousel } from './useCarousel';

const SKILLS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('useCarousel', () => {
    it('exposes the seven-card window around the selection', () => {
        const { result } = renderHook(() => useCarousel({ skillData: SKILLS }));
        expect(result.current.items).toHaveLength(7);
        expect(result.current.items.find((item) => item.offset === 0).id).toBe('a');
    });

    it('moves on a drag past the threshold and plays a sound', () => {
        const onRight = vi.fn();
        const { result } = renderHook(() => useCarousel({ skillData: SKILLS, onRight }));

        act(() => result.current.dragStart(200));
        act(() => result.current.dragMove(50)); // leftward drag -> next

        expect(result.current.selectedIndex).toBe(1);
        expect(onRight).toHaveBeenCalledTimes(1);
    });

    it('ignores drags below the threshold', () => {
        const onRight = vi.fn();
        const { result } = renderHook(() => useCarousel({ skillData: SKILLS, onRight }));

        act(() => result.current.dragStart(200));
        act(() => result.current.dragMove(150));

        expect(result.current.selectedIndex).toBe(0);
        expect(onRight).not.toHaveBeenCalled();
    });

    it('moves on card clicks and ignores the centre card', () => {
        const onLeft = vi.fn();
        const { result } = renderHook(() => useCarousel({ skillData: SKILLS, onLeft }));

        act(() => result.current.clickCard(0));
        expect(result.current.selectedIndex).toBe(0);

        act(() => result.current.clickCard(-1));
        expect(result.current.selectedIndex).toBe(-1);
        expect(onLeft).toHaveBeenCalledTimes(1);
    });

    it('is inert while battling', () => {
        const onRight = vi.fn();
        const { result } = renderHook(() =>
            useCarousel({ skillData: SKILLS, battling: true, onRight }),
        );

        act(() => result.current.dragStart(200));
        act(() => result.current.dragMove(50));
        act(() => result.current.clickCard(1));

        expect(result.current.selectedIndex).toBe(0);
        expect(onRight).not.toHaveBeenCalled();
    });
});
