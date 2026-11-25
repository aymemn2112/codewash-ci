import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    createSfxPlayer,
    getBGMManager,
    playUISound,
    playClick,
    playMobHurt,
    playMobDeath,
    playMobSay,
} from './soundManager';

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
});

describe('SFX volume', () => {
    it('starts at 0.5 and can be changed on the player instance', () => {
        const player = createSfxPlayer();
        expect(player.getVolume()).toBe(0.5);
        player.setVolume(0.8);
        expect(player.getVolume()).toBe(0.8);
    });

    it('creates audio elements with the player volume', () => {
        const { instances } = stubAudio();
        const player = createSfxPlayer();
        player.setVolume(0.4);

        expect(player.create('assets/sounds/ui/click.wav')).toBe(instances[0]);
        expect(instances[0].volume).toBe(0.4);
    });

    it('applies the current volume to UI sounds', () => {
        const { AudioCtor, instances } = stubAudio();
        const player = createSfxPlayer();
        player.setVolume(0.3);

        playUISound('click', player);

        expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/ui/click.wav');
        expect(instances[0].volume).toBe(0.3);
        expect(instances[0].play).toHaveBeenCalled();
    });

    it('keeps player volumes independent', () => {
        const first = createSfxPlayer({ volume: 0.2 });
        const second = createSfxPlayer({ volume: 0.9 });

        expect(first.getVolume()).toBe(0.2);
        expect(second.getVolume()).toBe(0.9);
    });

    it('does nothing for an unknown UI sound', () => {
        const { AudioCtor } = stubAudio();
        playUISound('does-not-exist');
        expect(AudioCtor).not.toHaveBeenCalled();
    });

    it('exposes the click shortcut', () => {
        const { AudioCtor } = stubAudio();
        playClick();
        expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/ui/click.wav');
    });
});

describe('mob sounds', () => {
    it('maps display names to folder paths', () => {
        const { AudioCtor } = stubAudio();

        playMobHurt('Zombie');
        playMobDeath('Ender Dragon');
        playMobSay('Axolotl');
        playMobSay('Villager');

        expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/mob/zombie/hurt.wav');
        expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/mob/enderdragon/death.wav');
        expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/mob/villager/say.wav');
        expect(AudioCtor).toHaveBeenCalledTimes(3);
    });

    it('ignores mobs without a sound folder', () => {
        const { AudioCtor } = stubAudio();
        playMobHurt('Unknown Mob');
        playMobDeath('Axolotl');
        expect(AudioCtor).not.toHaveBeenCalled();
    });
});

describe('BGM manager', () => {
    it('creates a fresh manager on each call', () => {
        expect(getBGMManager()).not.toBe(getBGMManager());
    });

    it('stores and applies volume', () => {
        const manager = getBGMManager();
        manager.setVolume(0.42);
        expect(manager.volume).toBe(0.42);
        manager.setVolume(0.3);
    });

    it('plays a track once and reuses the audio element', () => {
        const { AudioCtor } = stubAudio();
        const manager = getBGMManager();
        manager.audio = null;
        manager.currentTrackIndex = -1;
        manager.isPlaying = false;
        vi.spyOn(Math, 'random').mockReturnValue(0);

        manager.play();
        expect(AudioCtor).toHaveBeenCalledTimes(1);
        expect(manager.isPlaying).toBe(true);
        expect(manager.audio.play).toHaveBeenCalled();

        manager.play();
        expect(AudioCtor).toHaveBeenCalledTimes(1);
    });

    it('picks a track different from the current one', () => {
        const manager = getBGMManager();
        manager.currentTrackIndex = 2;
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(manager.getRandomTrack()).toBe(0);

        vi.spyOn(Math, 'random').mockReturnValue(0.999);
        expect(manager.getRandomTrack()).toBe(5);
    });
});

describe('BGM manager with an injected rng', () => {
    it('getRandomTrack uses the given rng instead of Math.random', () => {
        const manager = getBGMManager();
        const spy = vi.spyOn(Math, 'random');
        manager.currentTrackIndex = 2;

        expect(manager.getRandomTrack(() => 0)).toBe(0);
        expect(manager.getRandomTrack(() => 0.999)).toBe(5);
        expect(spy).not.toHaveBeenCalled();

        manager.currentTrackIndex = -1;
    });
});
