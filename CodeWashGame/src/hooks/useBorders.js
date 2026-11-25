import { useEffect, useState } from 'react';
import { browserStorage } from '../services/storage';
import { getBorderEffectKey, getBorderColorKey } from '../services/storageKeys';

/**
 * Cosmetics borders per profile, persisted through the storage service.
 */
export function useBorders(profileId) {
    const [selectedBorder, setSelectedBorder] = useState(
        () => browserStorage.getItem(getBorderEffectKey(profileId)) || 'solid',
    );
    const [borderColor, setBorderColor] = useState(
        () => browserStorage.getItem(getBorderColorKey(profileId)) || '#FFD700',
    );

    useEffect(() => {
        browserStorage.setItem(getBorderEffectKey(profileId), selectedBorder);
        browserStorage.setItem(getBorderColorKey(profileId), borderColor);
    }, [selectedBorder, borderColor, profileId]);

    return { selectedBorder, setSelectedBorder, borderColor, setBorderColor };
}

export default useBorders;
