import { useCallback, useEffect, useRef, useState } from 'react';
import { getBGMManager, setSfxVolume } from '../utils/soundManager';

/**
 * BGM/SFX volume state plus the side effects that push them to the sound
 * manager, and `startBGM` for the first user interaction.
 */
export function useAudioSettings({ initialBgm = 0.3, initialSfx = 0.5 } = {}) {
    const [bgmVol, setBgmVol] = useState(initialBgm);
    const [sfxVol, setSfxVol] = useState(initialSfx);
    const bgmManager = useRef(getBGMManager());

    useEffect(() => {
        bgmManager.current.setVolume(bgmVol);
    }, [bgmVol]);

    useEffect(() => {
        setSfxVolume(sfxVol);
    }, [sfxVol]);

    const startBGM = useCallback(() => {
        if (!bgmManager.current.isPlaying) {
            bgmManager.current.play();
        }
    }, []);

    return { bgmVol, setBgmVol, sfxVol, setSfxVol, startBGM };
}

export default useAudioSettings;
