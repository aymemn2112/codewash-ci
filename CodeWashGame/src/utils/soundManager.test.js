import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getBGMManager,
  setSfxVolume,
  getSfxVolume,
  playUISound,
  playClick,
  playMobHurt,
  playMobDeath,
  playMobSay,
} from './soundManager'

const createAudioMock = () => ({
  volume: 0,
  src: '',
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  addEventListener: vi.fn(),
})

const stubAudio = () => {
  const instances = []
  const AudioCtor = vi.fn(function AudioMock() {
    const audio = createAudioMock()
    instances.push(audio)
    return audio
  })
  vi.stubGlobal('Audio', AudioCtor)
  return { AudioCtor, instances }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setSfxVolume(0.5)
})

describe('SFX volume', () => {
  it('starts at 0.5 and can be changed', () => {
    expect(getSfxVolume()).toBe(0.5)
    setSfxVolume(0.8)
    expect(getSfxVolume()).toBe(0.8)
  })

  it('applies the current volume to UI sounds', () => {
    const { AudioCtor, instances } = stubAudio()
    setSfxVolume(0.3)

    playUISound('click')

    expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/ui/click.wav')
    expect(instances[0].volume).toBe(0.3)
    expect(instances[0].play).toHaveBeenCalled()
  })

  it('does nothing for an unknown UI sound', () => {
    const { AudioCtor } = stubAudio()
    playUISound('does-not-exist')
    expect(AudioCtor).not.toHaveBeenCalled()
  })

  it('exposes the click shortcut', () => {
    const { AudioCtor } = stubAudio()
    playClick()
    expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/ui/click.wav')
  })
})

describe('mob sounds', () => {
  it('maps display names to folder paths', () => {
    const { AudioCtor } = stubAudio()

    playMobHurt('Zombie')
    playMobDeath('Ender Dragon')
    playMobSay('Axolotl')
    playMobSay('Villager')

    expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/mob/zombie/hurt.wav')
    expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/mob/enderdragon/death.wav')
    expect(AudioCtor).toHaveBeenCalledWith('assets/sounds/mob/villager/say.wav')
    expect(AudioCtor).toHaveBeenCalledTimes(3)
  })

  it('ignores mobs without a sound folder', () => {
    const { AudioCtor } = stubAudio()
    playMobHurt('Unknown Mob')
    playMobDeath('Axolotl')
    expect(AudioCtor).not.toHaveBeenCalled()
  })
})

describe('BGM manager', () => {
  it('is a singleton', () => {
    expect(getBGMManager()).toBe(getBGMManager())
  })

  it('stores and applies volume', () => {
    const manager = getBGMManager()
    manager.setVolume(0.42)
    expect(manager.volume).toBe(0.42)
    manager.setVolume(0.3)
  })

  it('plays a track once and reuses the audio element', () => {
    const { AudioCtor } = stubAudio()
    const manager = getBGMManager()
    manager.audio = null
    manager.currentTrackIndex = -1
    manager.isPlaying = false
    vi.spyOn(Math, 'random').mockReturnValue(0)

    manager.play()
    expect(AudioCtor).toHaveBeenCalledTimes(1)
    expect(manager.isPlaying).toBe(true)
    expect(manager.audio.play).toHaveBeenCalled()

    manager.play()
    expect(AudioCtor).toHaveBeenCalledTimes(1)
  })

  it('picks a track different from the current one', () => {
    const manager = getBGMManager()
    manager.currentTrackIndex = 2
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(manager.getRandomTrack()).toBe(0)

    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    expect(manager.getRandomTrack()).toBe(5)
  })
})