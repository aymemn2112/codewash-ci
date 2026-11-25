import { describe, it, expect, vi, afterEach } from 'vitest';
import { createBGMManager, playUISound, playClick, playMobDeath } from './soundManager';

const createAudioMock = () => ({
    volume: 0,
    src: '',
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    addEventListener: vi.fn(),
});

const stubAudio = () => {
    const AudioCtor = vi.fn(function AudioMock() {
        return createAudioMock();
    });
    vi.stubGlobal('Audio', AudioCtor);
    return { AudioCtor };
};

const audioFactory = () => {
    const factory = vi.fn((src) => ({ ...createAudioMock(), src }));
    return factory;
};

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('injected audio factory', () => {
    it('creates independent BGM managers', () => {
        stubAudio();
        const factory = audioFactory();

        const first = createBGMManager({ audioFactory: factory });
        const second = createBGMManager({ audioFactory: factory });

        expect(first).not.toBe(second);
    });

    it('uses the injected factory for BGM and never calls global Audio', () => {
        const { AudioCtor } = stubAudio();
        const factory = audioFactory();
        const manager = createBGMManager({ audioFactory: factory });

        manager.play();

        expect(factory).toHaveBeenCalledWith(expect.stringMatching(/^assets\/sounds\/bgm\//));
        expect(AudioCtor).not.toHaveBeenCalled();
    });

    it('uses the injected factory for a named UI sound', () => {
        const { AudioCtor } = stubAudio();
        const factory = audioFactory();

        playUISound('levelup', factory);

        expect(factory).toHaveBeenCalledWith('assets/sounds/ui/levelup.wav');
        expect(AudioCtor).not.toHaveBeenCalled();
    });

    it('forwards the injected factory through UI wrappers', () => {
        const { AudioCtor } = stubAudio();
        const factory = audioFactory();

        playClick(factory);

        expect(factory).toHaveBeenCalledWith('assets/sounds/ui/click.wav');
        expect(AudioCtor).not.toHaveBeenCalled();
    });

    it('uses the injected factory for mob sounds', () => {
        const { AudioCtor } = stubAudio();
        const factory = audioFactory();

        playMobDeath('Zombie', factory);

        expect(factory).toHaveBeenCalledWith('assets/sounds/mob/zombie/death.wav');
        expect(AudioCtor).not.toHaveBeenCalled();
    });
});
