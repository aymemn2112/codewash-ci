import { useCallback, useMemo, useState } from 'react';
import { getVisibleItems } from '../domain/carousel';
import { SKILL_DATA } from '../constants/gameData';

const DRAG_THRESHOLD = 100;

/**
 * Carousel selection, drag and click navigation.
 * Keeps the index/window math out of App.
 */
export function useCarousel({
    skillData = SKILL_DATA,
    battling = false,
    onLeft = () => {},
    onRight = () => {},
} = {}) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);

    const items = useMemo(
        () => getVisibleItems(selectedIndex, skillData),
        [selectedIndex, skillData],
    );

    const dragStart = useCallback(
        (clientX) => {
            if (battling) return;
            setIsDragging(true);
            setDragStartX(clientX);
        },
        [battling],
    );

    const dragMove = useCallback(
        (clientX) => {
            if (!isDragging || battling) return;
            const diff = dragStartX - clientX;
            if (Math.abs(diff) < DRAG_THRESHOLD) return;

            if (diff > 0) {
                setSelectedIndex((index) => index + 1);
                onRight();
            } else {
                setSelectedIndex((index) => index - 1);
                onLeft();
            }
            setIsDragging(false);
        },
        [isDragging, battling, dragStartX, onLeft, onRight],
    );

    const dragEnd = useCallback(() => setIsDragging(false), []);

    const clickCard = useCallback(
        (offset) => {
            if (battling || offset === 0) return;
            setSelectedIndex((index) => index + offset);
            if (offset > 0) onRight();
            else onLeft();
        },
        [battling, onLeft, onRight],
    );

    return {
        selectedIndex,
        setSelectedIndex,
        isDragging,
        items,
        dragStart,
        dragMove,
        dragEnd,
        clickCard,
    };
}

export default useCarousel;
