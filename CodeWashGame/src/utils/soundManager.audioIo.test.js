import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBGMManager, setSfxVolume, playUISound, playMobHurt } from './soundManager';

const createAudioMock = () => ({
    volume: 0,
    src: '',
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    addEventListener: vi.fn(),
});

const stubAudio = () => {
    const instances = [];
    const AudioCtor = vi.fn(function AudioMock() {
        const audio = createAudioMock();
        instances.push(audio);
        return audio;
    });
    vi.stubGlobal('Audio', AudioCtor);
    return { AudioCtor, instances };
};

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setSfxVolume(0.5);
});

describe('audio output before injection', () => {
    it('creates UI sounds through the global Audio constructor', () => {
        const { AudioCtor, instances } = stubAudio();
        setSfxVolume(0.3);

        playUISound('levelup');

        expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/ui/levelup.wav');
        expect(instances[0].volume).toBe(0.3);
        expect(instances[0].play).toHaveBeenCalledTimes(1);
    });

    it('creates mob sounds through the global Audio constructor', () => {
        const { AudioCtor } = stubAudio();

        playMobHurt('Zombie');

        expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/mob/zombie/hurt.wav');
    });

    it('reuses one audio element for the BGM manager', () => {
        const { AudioCtor, instances } = stubAudio();
        const manager = getBGMManager();
        manager.audio = null;
        manager.currentTrackIndex = -1;
        manager.isPlaying = false;

        manager.play();
        manager.play();

        expect(AudioCtor).toHaveBeenCalledTimes(1);
        expect(instances[0].addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
    });
});
