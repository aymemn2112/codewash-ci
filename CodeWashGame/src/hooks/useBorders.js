import { useEffect, useState } from 'react';

/**
 * Cosmetics borders per profile, persisted in localStorage.
 */
export function useBorders(profileId) {
    const [selectedBorder, setSelectedBorder] = useState(
        () => localStorage.getItem(`borderEffect_p${profileId}`) || 'solid',
    );
    const [borderColor, setBorderColor] = useState(
        () => localStorage.getItem(`borderColor_p${profileId}`) || '#FFD700',
    );

    useEffect(() => {
        localStorage.setItem(`borderEffect_p${profileId}`, selectedBorder);
        localStorage.setItem(`borderColor_p${profileId}`, borderColor);
    }, [selectedBorder, borderColor, profileId]);

    return { selectedBorder, setSelectedBorder, borderColor, setBorderColor };
}

export default useBorders;
