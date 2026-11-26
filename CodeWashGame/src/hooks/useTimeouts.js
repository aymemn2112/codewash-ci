import { useCallback, useEffect, useRef } from 'react';

/**
 * Tracks `setTimeout` handles scheduled by a component and clears them on
 * unmount, preventing state updates after the component is gone.
 *
 * Usage: `const { schedule } = useTimeouts(); schedule(() => doThing(), 500);`
 */
export function useTimeouts() {
    const ids = useRef(new Set());

    useEffect(() => {
        const pending = ids.current;
        return () => {
            pending.forEach((id) => clearTimeout(id));
            pending.clear();
        };
    }, []);

    const schedule = useCallback((fn, delay) => {
        const id = setTimeout(() => {
            ids.current.delete(id);
            fn();
        }, delay);
        ids.current.add(id);
        return id;
    }, []);

    const clear = useCallback((id) => {
        clearTimeout(id);
        ids.current.delete(id);
    }, []);

    return { schedule, clear };
}

export default useTimeouts;
