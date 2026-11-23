import { useCallback, useEffect, useState } from 'react';
import { playClick } from '../utils/soundManager';
import { logger } from '../lib/logger';

/**
 * Fullscreen state + toggle, isolated from App.
 * Keeps the browser API behind one place (D-26).
 */
export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggle = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch((err) => {
                logger.warn('Failed to enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen?.().catch((err) => {
                logger.warn('Failed to exit fullscreen:', err);
            });
        }
        playClick();
    }, []);

    return { isFullscreen, toggle };
}

export default useFullscreen;
